var express = require('express');
var app = express();

//cookie-parser
var cookieParser = require('cookie-parser');
app.use(cookieParser());

var PORT = 8080; //default port 8080

//body-parser
const bodyParser = require('body-parser');

//body-parser converts the body of data into an object.
// comes in as req = a=b&x=y 
//conversts to an object req = { "a":b, "x": y }
app.use(bodyParser.urlencoded({
    extended: true
}));

//This tells the Express app to use EJS as its templating engine.
app.set('view engine', 'ejs');

//Referenced this code from https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function generateRandomString() {
    var string = '';
    var options = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 6; i++) {
        string += options.charAt(Math.floor(Math.random() * options.length))
    };
    return string;
};

//urlDatabase is an object.
var urlDatabase = {
    'b2xVn2': 'http://www.lighthouselabs.ca',
    '9sm5xK': 'http://www.google.com',
    '4ATLPk': 'http://microsoft.com'
};

//adding routes... 

//route handle for /urls, using the urlDatabase object.
app.get('/urls', (req, res) => {
    let templateVars = {
        urls: urlDatabase,
        username: req.cookies["username"]
    };
    res.render('urls_index', templateVars);
});

//route handler to render the page with the form
//in case of overlap, routes should be ordered from most specific to least specific.
//this has to be above /url/:id
app.get('/urls/new', (req, res) => {
    let templateVars = {
        username: req.cookies["username"]
    };
    res.render('urls_new', templateVars);
});


//route handle for /urls/:id
app.get('/urls/:id', (req, res) => {
// previous way of writing this code:
    // const shortURL = req.params.shortURL;
    // const longURL = urlDatabase[shortURL];
    // let templateVars = { shortURL: shortURL, longURL: longURL };
    let templateVars = {
        shortURL: req.params.id,
        longURL: urlDatabase[req.params.id],
        username: req.cookies["username"]
    };
    res.render('urls_show', templateVars);
});

//We need to define the route that will match this POST request and handle it. Let's start with a simple definition that logs the request body and gives a dummy response.
app.post('/urls', (req, res) => {
    var shortURL = generateRandomString();
    var longURL = req.body.longURL;
    urlDatabase[shortURL] = longURL;
    res.redirect('/urls');
    //console.log(req.body); // debug statement to see POST parameters
    //res.send('Ok'); // Respond with 'Ok' (we will replace this)
});
// this logs my url database so I can see anything in there that's been posted.
// console.log(urlDatabase);


//redirect to a new page (the acutal URL page) using the shortURL
app.get('/u/:shortURL', (req, res) => {
    var shortURL = req.params.shortURL;
    var longURL = urlDatabase[shortURL];
    res.redirect(longURL);
});

// POST route that removes a URL resource and redirects to the urls page with the removed target id.
app.post('/urls/:id/delete', (req, res) => {
    // 1. get the target id
    let targetId = req.params.id;

    // 2. delete the targetId from the urlDatabase.
    delete urlDatabase[targetId];

    // 3. Redirect to the url list
    res.redirect('/urls');
});

//POST the updated url 
app.post('/urls/:id', (req, res) => {

    let longURL = req.body.longURL;
    let shortURL = req.params.id;
    urlDatabase[shortURL] = longURL;
    res.redirect('/urls');
});

// POST route to store the username in cookies 
app.post('/login', function (req, res) {
    res.cookie("username", req.body.username);
    res.redirect('/urls');
});


// POST route for logout
// Must include a clear cookie in order to remove the username
app.post('/logout', function (req, res) {
    res.clearCookie("username")
    res.redirect('/urls');
});




// Reference code for fun.
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