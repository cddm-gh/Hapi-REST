const { question } = require('../models/index');

// Métodos del servidor permiten usarlos de manera global en cualquier ruta por medio del request
async function setAnswerRight(questionId, answerId, user) {
  let result;
  try {
    result = await question.setAnswerRight(questionId, answerId, user);
  } catch (err) {
    console.error(err);
    return false;
  }
  return result;
}

async function getLast(amount) {
  let data;
  try {
    data = await question.getLast(amount);
  } catch (err) {
    console.error(err);
  }
  console.log('Se ejecutó el método');
  return data;
}

module.exports = {
  setAnswerRight,
  getLast,
};
