/* eslint-disable no-unused-vars */
const joi = require('@hapi/joi');
const Boom = require('@hapi/boom');
const { question } = require('../models/index');
const { user } = require('../models/index');
/* Plugin personalizado
  En Hapi, un plugin es un Objeto que tiene básicamente la siguiente estructura: const plugin = {
  'name'    : 'miPlugin', // --- requerido
  'version' : '1.0.0', // --- opcional
  'register': function (server, options) {
    ...
  }
  * En server se indica la referencia de cuál servidor se la añadirán
  las responsabilidades asociadas a este plugin.
  * En opciones se pueden colocar parámetros externos como credenciales,
  condiciones especiales, entre otras.
*/
module.exports = {
  name: 'api-rest',
  version: '1.0.0',
  async register(server, options) {
    const prefix = options.prefix || 'api'; // el prefijo para las rutas a usar
    function failValidation(req, h, error) {
      return Boom.badRequest('Usa los parámetros correctos');
    }
    /*
      estrategia de autenticación
      Donde simple es el nombre de la estrategia de autenticación,
      basic es el tipo (asociado al módulo que instalamos) y validateAuth
      es el método en el que definiremos la lógica de validación de los usuarios.
    */
    async function validateAuth(req, email, password, h) {
      let logUser;
      try {
        logUser = await user.validate({ email, password });
      } catch (err) {
        server.log('error', `${err}`);
      }
      return {
        credentials: logUser || {},
        isValid: (logUser !== false),
      };
    }
    await server.register(require('@hapi/basic'));
    server.auth.strategy('simple', 'basic', { validate: validateAuth });

    // buscar solo 1 pregunta
    server.route({
      method: 'GET',
      path: `/${prefix}/question/{key}`,
      options: {
        auth: 'simple',
        validate: {
          params: joi.object({
            key: joi.string().required(),
          }),
          failAction: failValidation,
        },
      },
      handler: async (req, h) => {
        let result;
        try {
          result = await question.getOne(req.params.key);
          if (!result) return Boom.notFound(`No se encontró la pregunta ${req.params.key}`);
        } catch (err) {
          return Boom.badImplementation(`Error buscando ${req.params.key} - ${err}`);
        }
        return result;
      },
    });
    // buscar todas las preguntas
    server.route({
      method: 'GET',
      path: `/${prefix}/questions/{amount}`,
      options: {
        auth: 'simple',
        validate: {
          params: joi.object({
            amount: joi.number().integer().min(1).max(20)
              .required(),
          }),
          failAction: failValidation,
        },
      },
      handler: async (req, h) => {
        let result;
        try {
          result = await question.getLast(req.params.amount);
          if (!result) return Boom.notFound('No se encontraron preguntas');
        } catch (err) {
          return Boom.badImplementation(`Error buscando las preguntas - ${err}`);
        }
        return result;
      },
    });
  },
};
