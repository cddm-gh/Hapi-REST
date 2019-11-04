const firebase = require('firebase-admin');
const User = require('./users');
const Question = require('./questions');
const serviceAccount = require('../config/hapinode-841c5.json');

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://hapinode-841c5.firebaseio.com/',
});

const db = firebase.database();

module.exports = {
  user: new User(db),
  question: new Question(db),
};
