var express = require('express');
var app = express();
var PORT = 8080;
const bcrypt = require('bcrypt');
var cookieSession = require('cookie-session');
app.use(cookieSession({
    keys: ['secret-secret'],
    name: 'session'
}));
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set('view engine', 'ejs');



/* -------------------functions--------------------*/
//Referenced this code from https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function generateRandomString() {
    var string = '';
    var options = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 6; i++) {
        string += options.charAt(Math.floor(Math.random() * options.length))
    };
    return string;
};

//function to check if the email entered in the registration matches an email in the database.
function checkEmail(email) {
    for (const userId in userDatabase) {
        if (userDatabase[userId].email === email) {
            return true;
        }
    }
    return false;
};

// Function to filter the urlDatabase and compare with the userId to the logged-in user's ID.
function urlsForUser(userId) {
    var urlsUserList = {};
    for (const shortURL in urlDatabase) {
        if (urlDatabase[shortURL].userId === userId) {
            urlsUserList[shortURL] = urlDatabase[shortURL]
        }
    }
    return urlsUserList;
};



/* -------------------databases--------------------*/

var urlDatabase = {
    'b2xVn2': {
        longURL: 'http://www.lighthouselabs.ca',
        userId: 'user1RandomId'
    },
    '9sm5xK': {
        longURL: 'http://www.google.com',
        userId: 'user2RandomId'
    },
    '4ATLPk': {
        longURL: 'http://microsoft.com',
        userId: 'user1RandomId'
    }
};

const userDatabase = {
    'user1RandomId': {
        userId: 'user1RandomId',
        email: 'user@example.com',
        password: bcrypt.hashSync('purple-monkey-dinosaur', 10)
    },
    'user2RandomId': {
        userId: 'user2RandomId',
        email: 'user2@example.com',
        password: bcrypt.hashSync('dishwasher-funk', 10)
    },
    'boDVdD': {
        userId: 'boDVdD',
        email: 'andrea@andrea.com',
        password: bcrypt.hashSync('1234', 10)
    }
};

/* -------------------routes--------------------*/

//route handle for /urls, using the urlDatabase object.
app.get('/urls', (req, res) => {
    let userId = req.session.userId
    if (userId) {
        let userSpecificURLDatabase = (urlsForUser(userId));
        let templateVars = {
            urls: userSpecificURLDatabase,
            user: userDatabase[userId]
        };
        res.render('urls_index', templateVars);
    } else {
        res.send('You must login in to view this page');
    }
});

//Route Handler: posts the new shortURL and longURL data on the /urls page.
app.post('/urls', (req, res) => {
    var shortURL = generateRandomString();
    var longURL = req.body.longURL;
    urlDatabase[shortURL] = {
        shortURL: shortURL,
        longURL: longURL,
        userId: req.session.userId
    }
    res.redirect('/urls');
});



//Route Handler --> renders the form to generate a new shortURL by entering in a long url.
//this has to be above /url/:id
app.get('/urls/new', (req, res) => {
    let userId = req.session.userId
    let templateVars = {
        user: userDatabase[userId],
    };
    if (userId) {
        res.render('urls_new', templateVars);
    } else {
        res.redirect('/login');
    }
});

//route handle for /urls/:id
app.get('/urls/:id', (req, res) => {

    let userId = req.session.userId
    let userSpecificURLDatabase = (urlsForUser(userId));

    if (userSpecificURLDatabase[req.params.id] === undefined) {
        res.send('You do not have access to this page. Sorry!');
    }

    if (userId) {
        let templateVars = {
            shortURL: req.params.id,
            urls: userSpecificURLDatabase,
            longURL: userSpecificURLDatabase[req.params.id].longURL,
            user: userDatabase[userId],
        };
        res.render('urls_show', templateVars);
    } else {
        res.send('You must login in to view this page');
    }
});


// //Route Handler: posts the new shortURL and longURL data on the /urls page.
//redirect to a new page (the acutal URL page) using the shortURL
app.get('/u/:shortURL', (req, res) => {

    var shortURL = req.params.shortURL;
    var longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
});

// POST route that removes a URL resource and redirects to the urls page with the removed target id.
// delete action
app.post('/urls/:id/delete', (req, res) => {
    // 1. get the target id
    let targetId = req.params.id;

    // 2. delete the targetId from the urlDatabase.
    delete urlDatabase[targetId];

    // 3. Redirect to the url list
    res.redirect('/urls');
});

//POST the updated url 
// update action
app.post('/urls/:id', (req, res) => {
    let longURL = req.body.longURL;
    let shortURL = req.params.id;
    urlDatabase[shortURL].longURL = longURL;
    res.redirect('/urls');
});


// POST route for logout
app.post('/logout', function (req, res) {
    // Must include a clear cookie in order to remove the username
    req.session = null;
    // res.clearCookie("userId");
    res.redirect('/login');
});

// GET route for /register page to show up
app.get('/register', function (req, res) {
    res.render('register');
});

// POST route for once register button has been clicke, redirect to /urls
app.post('/register', function (req, res) {
    // this is guarding my code, I'm first checking if the data is good data.
    if (req.body.email === "" || req.body.password === '') {
        res.status(400).send('You need to enter an email address and a password.');
        return;
    }
    if (checkEmail(req.body.email)) {
        res.status(400).send('This email has already been registered.');
        return;
    }

    let randomUserId = generateRandomString();
    let password = req.body.password;
    let hashedPassword = bcrypt.hashSync(password, 10);

    userDatabase[randomUserId] = {
        userId: randomUserId,
        email: req.body.email,
        password: hashedPassword
    }
    req.session.userId = randomUserId;

    res.redirect('/urls');

});


// GET route for /login page 
app.get('/login', function (req, res) {
    let userId = req.session.userId
    let templateVars = {
        user: userDatabase,
        userId: userId,
    };

    res.render('login', templateVars);
});

// POST route for /login page (also store the username in cookies)
app.post('/login', function (req, res) {
    let email = req.body.email;
    let password = req.body.password;
    if (password === '' || email === '') {
        res.send('You have to enter an email and a password');
        return;
    } else {
        for (let userId in userDatabase) {
            if (userDatabase[userId].email === email && bcrypt.compareSync(password, userDatabase[userId].password)) {
                req.session['userId'] = userId;
                res.redirect('/urls');
                return;
            }
        }
        res.status(400);
        res.send('Your password and username do not match.');
    }

});

app.get('/', (req, res) => {
    res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
    res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
    res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});