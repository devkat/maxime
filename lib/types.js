var
  parser = require('../dist/parser').parser;

function checkTypes(ast, scope) {
  ast.checkTypes();
}

module.exports = checkTypes;
