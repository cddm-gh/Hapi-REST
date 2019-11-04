const Joi = require('@hapi/joi');
const site = require('./controllers/site');
const users = require('./controllers/user');
const questions = require('./controllers/question');
const middlewares = require('./lib/middlewares');

module.exports = [
  {
    method: 'GET',
    path: '/assets/{param*}',
    handler: {
      directory: {
        path: '.',
        index: ['index.html'],
      },
    },
  },
  {
    method: 'GET',
    path: '/',
    options: {
      cache: {
        expiresIn: 1000 * 30,
        privacy: 'private',
      },
    },
    handler: site.home,
  },
  {
    method: 'GET',
    path: '/register',
    handler: site.register,
  },
  {
    method: 'GET',
    path: '/login',
    handler: site.login,
  },
  {
    method: 'GET',
    path: '/logout',
    options: {
      pre: [
        { method: middlewares.isAuth },
      ],
    },
    handler: users.logout,
  },
  {
    method: 'POST',
    path: '/create-user',
    handler: users.createUser,
    options: {
      validate: { // validate the data that we sent in the POST request
        payload: Joi.object({
          name: Joi.string().required().min(2),
          email: Joi.string().required().min(5),
          password: Joi.string().required().min(6),
        }),
        failAction: users.failValidation, // handle error in case of validation failed
      },
    },
  },
  {
    method: 'POST',
    path: '/validate-user',
    handler: users.validateUser,
    options: {
      validate: {
        payload: Joi.object({
          email: Joi.string().required().min(5),
          password: Joi.string().required().min(6),
        }),
        failAction: users.failValidation,
      },
    },
  },
  {
    method: ['GET', 'POST'],
    path: '/{any*}',
    handler: site.notFound,
  },
  {
    method: 'GET',
    path: '/ask',
    handler: site.ask,
  },
  {
    method: 'POST',
    path: '/create-question',
    options: {
      pre: [
        { method: middlewares.isAuth },
      ],
      validate: {
        payload: Joi.object({
          title: Joi.string().required(),
          description: Joi.string().required(),
          image: Joi.any().optional(),
        }),
        failAction: users.failValidation,
      },
    },
    handler: questions.createQuestion,
  },
  {
    method: 'GET',
    path: '/question/{id}',
    options: {
      pre: [
        { method: middlewares.isAuth },
      ],
    },
    handler: site.viewQuestion,
  },
  {
    method: 'POST',
    path: '/answer-question',
    options: {
      pre: [
        { method: middlewares.isAuth },
      ],
      validate: {
        payload: Joi.object({
          answer: Joi.string().required(),
          id: Joi.string().required(),
        }),
        failAction: users.failedValidation,
      },
    },
    handler: questions.answerQuestion,
  },
  {
    method: 'GET',
    path: '/answer/{questionId}/{answerId}',
    options: {
      pre: [
        { method: middlewares.isAuth },
      ],
    },
    handler: questions.setAnswerRight,
  },
];
