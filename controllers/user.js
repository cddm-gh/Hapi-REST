const { user } = require('../models/index');

async function createUser(req, h) {
  try {
    await user.create(req.payload);
  } catch (err) {
    return h.view('register', {
      title: 'Registro',
      error: 'Error creando el usuario',
    });
  }
  return h.view('register', {
    title: 'Registro',
    success: 'Usuario registrado con exito',
  });
}

async function validateUser(req, h) {
  let result;
  try {
    result = await user.validate(req.payload);
    if (!result) {
      return h.view('login', {
        title: 'Login',
        error: 'Email o contraseña incorrecta',
      });
    }
  } catch (err) {
    return h.view('login', {
      title: 'Login',
      error: 'Error iniciando sesión',
    });
  }
  return h.redirect('/').state('user', {
    name: result.name,
    email: result.email,
  });
}

async function failedValidation(req, h, err) {
  const templates = {
    '/create-user': 'register',
    '/validate-user': 'login',
    '/create-question': 'ask',
    '/answer-question': 'question',
  };

  return h.view(templates[req.path], {
    title: 'Error de validación',
    error: `Por favor complete los campos requeridos. ${err}`,
  }).code(400).takeover();
}

function logout(req, h) {
  return h.redirect('/login').unstate('user');
}

module.exports = {
  createUser,
  validateUser,
  logout,
  failedValidation,
};
