const fs = require('fs');
const path = require('path');
const uuid = require('uuid/v1');
const { promisify } = require('util');
const { question } = require('../models/index');

const writeFile = promisify(fs.writeFile);

async function createQuestion(req, h) {
  let result;
  let filename;
  try {
    if (Buffer.isBuffer(req.payload.image)) {
      filename = `${uuid()}.png`;
      // await writeFile(path.join(__dirname, '..', 'public', 'uploads', filename), req.payload.ima
      await writeFile(path.join(__dirname, '..', 'public', 'uploads', filename), req.payload.image);
    }
    result = await question.create(req.payload, req.state.user, filename);
    req.log('info', `Pregunta creada con el ID ${result}`);
  } catch (err) {
    req.log('error', err);
    return h.view('ask', {
      title: 'Crear Pregunta',
      error: 'Problema al crear la pregunta',
    }).takeover();
  }
  return h.redirect(`/question/${result}`);
}

async function answerQuestion(req, h) {
  try {
    await question.answer(req.payload, req.state.user);
  } catch (err) {
    req.log('error', err);
  }
  return h.redirect(`/question/${req.payload.id}`);
}

async function setAnswerRight(req, h) {
  let result;
  try {
    result = await req.server.methods.setAnswerRight(req.params.questionId,
      req.params.answerId, req.state.user);
    req.log('info', result);
  } catch (err) {
    req.log('error', err);
    return false;
  }
  return h.redirect(`/question/${req.params.questionId}`);
}

module.exports = {
  createQuestion,
  answerQuestion,
  setAnswerRight,
};
