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

function checkEmail(email) {
    for (const userId in userDatabase) {
        if (userDatabase[userId].email === email) {
            return true;
        }
    }
    return false;
}
console.log(checkEmail('andrea@andrea.com'));
console.log(checkEmail('user2@example.com'));
console.log(checkEmail('NEW@example.com'));