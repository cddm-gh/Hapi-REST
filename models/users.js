const bcrypt = require('bcrypt');

class User {
  constructor(db) {
    this.db = db;
    this.ref = this.db.ref('/');
    this.collection = this.ref.child('users');
  }

  async create(data) {
    const newUser = this.collection.push();
    newUser.set({
      ...data,
      password: await this.constructor.encryptPassword(data.password),
    });

    return newUser.key;
  }

  async validate(data) {
    const userQuery = await this.collection.orderByChild('email').equalTo(data.email).once('value');
    const userFound = userQuery.val();
    if (userFound) {
      const userId = Object.keys(userFound)[0];
      const passwordRight = await bcrypt.compare(data.password, userFound[userId].password);
      const result = (passwordRight) ? userFound[userId] : false;

      return result;
    }
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  static async encryptPassword(password) {
    const saltRound = 10;
    const hashedPassword = await bcrypt.hash(password, saltRound);
    return hashedPassword;
  }
}

module.exports = User;
