const Hapi = require('@hapi/hapi');
const inert = require('@hapi/inert');
const vision = require('@hapi/vision');
const crumb = require('@hapi/crumb');
const scooter = require('@hapi/scooter');
const blankie = require('blankie');
const hapiDevErrors = require('hapi-dev-errors');
const path = require('path');
const handlebars = require('./lib/helpers');
const methods = require('./lib/methods');
const routes = require('./routes');
const site = require('./controllers/site');

const server = Hapi.server({
  port: process.env.PORT || 3000,
  host: process.env.HOST || 'localhost',
  routes: {
    files: {
      relativeTo: path.join(__dirname, 'public'),
    },
  },
});

async function init() {
  try {
    // registrando los plugins de hapi
    await server.register(inert);
    await server.register(vision);
    // registro del plugin 'good'
    await server.register({
      plugin: require('@hapi/good'),
      options: {
        ops: {
          interval: 1000 * 60 * 1,
        },
        reporters: {
          myConsoleReporters: [
            {
              module: require('@hapi/good-console'),
            },
            'stdout',
          ],
        },
      },
    });
    // plugin para prevenir ataques CSRF - Cross Site Request Forgery
    server.register({
      plugin: crumb,
      options: {
        cookieOptions: {
          isSecure: process.env.NODE_ENV === 'production', // false si es dev y true si estamos en prod
        },
      },
    });
    // plugin para prevenir ataques XSS - Cross Site Scripting
    /*
      implementaremos la estrategia de CSP o Content Security Policy
      para definir específicamente los orígenes desde los cuales vamos
      a permitir la ejecución de scripts o el acceso a recursos desde y hacia nuestra aplicación.
    */
    server.register([scooter, {
      plugin: blankie,
      options: {
        defaultSrc: "'self' 'unsafe-inline'",
        styleSrc: "'self' 'unsafe-inline' https://maxcdn.bootstrapcdn.com",
        fontSrc: "'self' 'unsafe-inline' data:",
        mediaSrc: "'self' 'unsafe-inline' data:",
        scriptSrc: "'self' 'unsafe-inline' https://code.jquery.com https://cdnjs.cloudflare.com https://maxcdn.bootstrapcdn.com",
        generateNonces: false,
      },
    }]);
    // plugin para mostrar los errores de manera amigable en el browser
    await server.register({
      plugin: hapiDevErrors,
      options: {
        showErrors: process.env.NODE_ENV !== 'production',
      },
    });
    // registrando nuestro plugin
    await server.register({
      plugin: require('./lib/api'),
      options: {
        prefix: 'api',
      },
    });
    // configurando los métodos de servidor
    server.method('setAnswerRight', methods.setAnswerRight);
    server.method('getLast', methods.getLast, {
      cache: {
        expiresIn: 1000 * 60,
        generateTimeout: 2000,
      },
    });

    server.state('user', {
      ttl: 1000 * 60 * 60 * 24 * 7,
      isSecure: process.env.NOT_ENV === 'production',
      encoding: 'base64json',
    });
    server.views({
      engines: {
        hbs: handlebars,
      },
      relativeTo: __dirname,
      path: 'views',
      layout: true,
      layoutPath: 'views',
    });
    server.ext('onPreResponse', site.fileNotFound);
    server.route(routes);
    await server.start();
  } catch (err) {
    server.log('ERROR', `${err}`);
    process.exit(1);
  }

  server.log('info', `Servidor iniciado en: ${server.info.uri}`);
}

process.on('unhandledRejection', (error) => {
  server.log('unhandledRejection', error.message);
});

process.on('unhandledException', (error) => {
  server.log('unhandledException', error.message);
});

init();
