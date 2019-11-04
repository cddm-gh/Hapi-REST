const handlebars = require('handlebars');

function registerHelper() {
  // registrar helper de handlebar
  handlebars.registerHelper('answerNumber', (answers) => {
    if (!answers) return 0;
    const keys = Object.keys(answers);
    return keys.length;
  });

  handlebars.registerHelper('ifEquals', (a, b, options) => {
    if (a === b) return options.fn(this);
    return options.inverse(this);
  });

  return handlebars;
}

module.exports = registerHelper();
