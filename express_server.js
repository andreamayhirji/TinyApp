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
    //REMINDER: return goes outside of the for in loop to ensure the for in loop keeps running.
    return false;
}


// let getUser = function (req) {
//     return userDatabase[req.cookies["userId"]]
// }


/* **************** DATABASES ************* */
//urlDatabase is an object.
var urlDatabase = {
    'b2xVn2': 'http://www.lighthouselabs.ca',
    '9sm5xK': 'http://www.google.com',
    '4ATLPk': 'http://microsoft.com'
};

//user database is an object
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


/* *********** ADDING ROUTES *********** */

//route handle for /urls, using the urlDatabase object.
app.get('/urls', (req, res) => {

    let userId = req.cookies["userId"]

    let templateVars = {
        urls: urlDatabase,
        // TODO:  can merge these into one. user: userDatabase[userId]. it will get rid of user and userId.
        user: userDatabase,
        userId: userId,
    };
    // console.log('user:', templateVars.user);
    // console.log('cookies:', req.cookies["userId"]);
    res.render('urls_index', templateVars);
    // this is how I check what the userId is associated with the cookie.
    // console.log('LOOK FOR THIS:', req.cookies['userId']);

});

//Route Handler --> renders the form to generate a new shortURL by entering in a long url.
//in case of overlap, routes should be ordered from most specific to least specific.
//this has to be above /url/:id
app.get('/urls/new', (req, res) => {
    let userId = req.cookies["userId"]
    let templateVars = {
        urls: urlDatabase,
        user: userDatabase,
        userId: userId,
    };
    
    res.render('urls_new', templateVars);
});


//route handle for /urls/:id
app.get('/urls/:id', (req, res) => {
    // previous way of writing this code:
    // const shortURL = req.params.shortURL;
    // const longURL = urlDatabase[shortURL];
    // let templateVars = { shortURL: shortURL, longURL: longURL };
    let userId = req.cookies["userId"]

    let templateVars = {
        shortURL: req.params.id,
        longURL: urlDatabase[req.params.id],
        urls: urlDatabase,      // TODO: delete this line?
        user: userDatabase,
        userId: userId,
    };
    res.render('urls_show', templateVars);
});

//Route Handler: posts the new shortURL and longURL data on the /urls page.
//We need to define the route that will match this POST request and handle it. Let's start with a simple definition that logs the request body and gives a dummy response.
app.post('/urls', (req, res) => {
    var shortURL = generateRandomString();
    var longURL = req.body.longURL;
    urlDatabase[shortURL] = longURL;
    res.redirect('/urls');
    // console.log(urlDatabase);
});

//redirect to a new page (the acutal URL page) using the shortURL
app.get('/u/:shortURL', (req, res) => {
    var shortURL = req.params.shortURL;
    var longURL = urlDatabase[shortURL];
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
    urlDatabase[shortURL] = longURL;
    res.redirect('/urls');
});

// // POST route to store the username in cookies 
// app.post('/login', function (req, res) {
//     res.cookie("userId", req.body.username); 
//     res.redirect('/urls');
// });


// POST route for logout
app.post('/logout', function (req, res) {
    // Must include a clear cookie in order to remove the username
    res.clearCookie("userId"); /* changed "username" to "userId" */
    res.redirect('/login');
});

// GET route for /register page to show up
app.get('/register', function (req, res) {
    res.render('register');
});

// POST route for once register button has been clicke, redirect to /urls
app.post('/register', function (req, res) {
    // this is guarding my code, I'm first checking if the data is good data.
    if (req.body['email'] === "" || req.body['password'] === '') {
        res.status(400).send('You need to enter an email address and a password.');
        return;
    }
    if (checkEmail(req.body['email'])) {
        res.status(400).send('This email has already been registered.');
        return;
    }
    // once the above two return false, I can do the normal thing below.
    // I know my data is good, so I can perform the function.
    let randomUserId = generateRandomString();
    //this sets up my database with the new randomUserId, and pulls the value  req.body.whatever into the appropriate keys.
    userDatabase[randomUserId] = {
        userId: randomUserId,
        email: req.body['email'], /* this could be req.body.email i think */
        password: req.body['password']
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
    // console.log('hey');
});

// POST route for /login page (also store the username in cookies)
app.post('/login', function (req, res) {
    // res.cookie("userId", req.body.username); 
    //?
    let email = req.body.username;
    let password = req.body.password;

    if (password === '' || email === '') {
        console.error('no way');
        res.send('You have to enter an email and a password');
        return;
    } else {
        for (let userId in userDatabase) {
            if (userDatabase[userId].password === password && userDatabase[userId].email === email) {
                res.cookie("userId", userId);
                res.redirect('/urls');
            } 
        } 
        res.status(400).send('Your password and username do not match.');
    } 

});













/* ***************** Reference code ************** */
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