class Question {
  constructor(db) {
    this.db = db;
    this.ref = this.db.ref('/');
    this.collection = this.ref.child('questions');
  }

  async create(info, user, filename) {
    // eslint-disable-next-line no-param-reassign
    const data = {
      description: info.description,
      title: info.title,
      owner: user,
    };
    if (filename) {
      data.filename = filename;
    }
    console.log('Data a grabar: ');
    console.log(JSON.stringify(data));
    const questions = this.collection.push();
    questions.set(data);

    return questions.key;
  }

  async getLast(amount) {
    const query = await this.collection.limitToLast(amount).once('value');
    const data = query.val();
    return data;
  }

  async getOne(id) {
    const query = await this.collection.child(id).once('value');
    const data = query.val();
    return data;
  }

  async answer(data, user) {
    const answers = await this.collection.child(data.id).child('answers').push();
    answers.set({
      text: data.answer,
      user,
    });
    return answers;
  }

  async setAnswerRight(questionId, answerId, user) {
    const query = await this.collection.child(questionId).once('value');
    const question = query.val();
    const { answers } = question;

    if (!user.email === question.owner.email) return false;

    // eslint-disable-next-line no-restricted-syntax
    for (const key in answers) {
      if (Object.prototype.hasOwnProperty.call(answers, key)) {
        answers[key].correct = (key === answerId);
      }
    }
    const update = await this.collection.child(questionId).child('answers').update(answers);
    return update;
  }
}

module.exports = Question;
