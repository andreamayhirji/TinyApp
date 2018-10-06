var express = require('express');
var app = express();

var cookieParser = require('cookie-parser');
app.use(cookieParser());

var PORT = 8080; //default port 8080

const bodyParser = require('body-parser');
//body-parser converts the body of data into an object.
// comes in as req = a=b&x=y 
//conversts to an object req = { "a":b, "x": y }
app.use(bodyParser.urlencoded({
    extended: true
}));

//This tells the Express app to use EJS as its templating engine.
app.set('view engine', 'ejs');

const bcrypt = require('bcrypt');
// const password = "purple-monkey-dinosaur"; // you will probably this from req.params
// const hashedPassword = bcrypt.hashSync(password, 10);



/* -------------------FUNCTIONS--------------------*/
// TODO: refactor this code to use Math.random.splice()etc
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
}

// Function to filter the urlDatabase and compare with the userId to the logged-in user's ID.
function urlsForUser(userId) {
    var urlsUserList = {};
    for (const shortURL in urlDatabase) {
        if (urlDatabase[shortURL].userId === userId) {
            urlsUserList[shortURL] = urlDatabase[shortURL]
        }
    }
    return urlsUserList;
}




// let getUser = function (req) {
//     return userDatabase[req.cookies["userId"]]
// }


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
}

const userDatabase = {
    'user1RandomId': {
        userId: 'user1RandomId',
        email: 'user@example.com',
        password: 'purple-monkey-dinosaur'
    },
    'user2RandomId': {
        userId: 'user2RandomId',
        email: 'user2@example.com',
        password: 'dishwasher-funk'
    },
    'boDVdD': {
        userId: 'boDVdD',
        email: 'andrea@andrea.com',
        password: '1234'
    }
};

/* -------------------routes--------------------*/

//route handle for /urls, using the urlDatabase object.
app.get('/urls', (req, res) => {

    let userId = req.cookies["userId"]
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
        longURL: req.body.longURL,
        userId: req.cookies.userId
    }
    // console.log('!!!', urlDatabase[shortURL])
    res.redirect('/urls');
});



//Route Handler --> renders the form to generate a new shortURL by entering in a long url.
//in case of overlap, routes should be ordered from most specific to least specific.
//this has to be above /url/:id
app.get('/urls/new', (req, res) => {

    let userId = req.cookies["userId"]
    let templateVars = {
        // urls: urlDatabase,
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
    // previous way of writing this code:
    // const shortURL = req.params.shortURL;
    // const longURL = urlDatabase[shortURL];
    // let templateVars = { shortURL: shortURL, longURL: longURL };
    let userId = req.cookies["userId"]
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
// app.post('/urls', (req, res) => {

// // This is not working. new urls are not being posted now that it is user specific.

//     var shortURL = generateRandomString();
//     var longURL = req.body.longURL;
//     urlDatabase[shortURL] = longURL;
//     res.redirect('/urls');
// });

//redirect to a new page (the acutal URL page) using the shortURL
app.get('/u/:shortURL', (req, res) => {
    //TODO: shortURL is not working, returns undefined.
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
    //TODO: this does not post the updated URL
    urlDatabase[shortURL].longURL = longURL;
    res.redirect('/urls');
});


// POST route for logout
app.post('/logout', function (req, res) {
    // Must include a clear cookie in order to remove the username
    res.clearCookie("userId");
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
    // once the above two return false, I can do the normal thing below.
    // I know my data is good, so I can perform the function.
    let randomUserId = generateRandomString();
    let password = req.body.password;
    let hashedPassword = bcrypt.hashSync(password, 10);
    userDatabase[randomUserId] = {
        userId: randomUserId,
        email: req.body.email,
        password: hashedPassword
    }
    //the cookie only needs to apply to my randomUserId since that is th object that contains the key value pairs I am looking for.
    res.cookie('userId', randomUserId);
    res.redirect('/urls');

});


// GET route for /login page 
app.get('/login', function (req, res) {
    let userId = req.cookies["userId"]
    let templateVars = {
        user: userDatabase,
        userId: userId,
    };

    res.render('login', templateVars);
});

// POST route for /login page (also store the username in cookies)
app.post('/login', function (req, res) {
    // res.cookie("userId", req.body.username); 
    let email = req.body.email;
    let password = req.body.password;

    if (password === '' || email === '') {
        console.error('no way');
        res.send('You have to enter an email and a password');
        return;
    } else {
        //if (userDatabase[userId].password === password && userDatabase[userId].email === email)
        for (let userId in userDatabase) {
            if (userDatabase[userId].email === email && bcrypt.compareSync(password, userDatabase[userId].password)) {
                res.cookie("userId", userId);
                res.redirect('/urls');
                return;
            }
        }
        res.status(400);
        res.send('Your password and username do not match.');
    }

});

// // POST route to store the username in cookies 
// app.post('/login', function (req, res) {
//     res.cookie("userId", req.body.username); 
//     res.redirect('/urls');
// });


/*-------------------------for learning----------------------- */
// app.get() is a function!
app.get('/', (req, res) => {
    //  ^ registers a handler on the root path '/'     
    res.send('Hello!');
});

//route handle for /urls.json
app.get('/urls.json', (req, res) => {
    res.json(urlDatabase);
});

//sending HTML and adding another route
app.get('/hello', (req, res) => {
    res.send('<html><body>Hello <b>World</b></body></html>\n');
});

//required on all server files.
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});