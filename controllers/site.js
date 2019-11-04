const { question } = require('../models/index');

async function home(req, h) {
  const data = await req.server.methods.getLast(10); // devolvemos las preguntas que están en cache
  return h.view('index', {
    title: 'home',
    user: req.state.user,
    questions: data,
  });
}

function register(req, h) {
  if (req.state.user) return h.redirect('/');
  return h.view('register', {
    title: 'Registro',
    user: req.state.user,
  });
}
function login(req, h) {
  if (req.state.user) return h.redirect('/');
  return h.view('login', {
    title: 'Login',
    user: req.state.user,
  });
}

function notFound(req, h) {
  return h.view('404', {}, { layout: 'error-layout' }).code(404);
}

function fileNotFound(req, h) {
  const { response } = req;
  if (!req.path.startsWith('/api') && response.isBoom && response.output.statusCode === 404) {
    return h.view('404', {}, { layout: 'error-layout' }).code(404);
  }
  return h.continue;
}

function ask(req, h) {
  if (!req.state.user) return h.redirect('/').code(403);
  return h.view('ask', {
    title: 'Crear pregunta',
    user: req.state.user,
  });
}

async function viewQuestion(req, h) {
  let data;
  try {
    data = await question.getOne(req.params.id);
    if (!data) return notFound(req, h);
  } catch (err) {
    req.log('error', err);
  }
  return h.view('question', {
    title: 'Detalles de la Pregunta',
    user: req.state.user,
    question: data,
    key: req.params.id,
  });
}

module.exports = {
  home,
  register,
  login,
  notFound,
  fileNotFound,
  ask,
  viewQuestion,
};
