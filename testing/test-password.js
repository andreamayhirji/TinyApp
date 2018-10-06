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

//if password matches

function checkPassword(email, password) {
    for (const userId in userDatabase) {
        if (userDatabase[userId].password === password && userDatabase[userId].email === email) {
            return true;
        }
    }
    return false;
}
console.log(checkPassword('purple-monkey-dinosaur'));
console.log(checkPassword('dishwasher-funk'));
console.log(checkPassword('fff'));