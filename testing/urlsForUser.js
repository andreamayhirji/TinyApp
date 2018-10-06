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

function urlsForUser(userId) {

    var urlsUserList = {};

    for (const shortURL in urlDatabase) {
        if (urlDatabase[shortURL].userId === userId) {
            urlsUserList[shortURL] = urlDatabase[shortURL]
        }
        
    } return urlsUserList;
}

console.log(urlsForUser('user2RandomId'));