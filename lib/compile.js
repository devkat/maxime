var
  fs = require('fs'),
  path = require('path'),
  parser = require('../dist/parser').parser,
  generate = require('./generate');

// you can also use the parser directly from memory

function compile(input) {
  var ast = parser.parse(input);
  console.log('AST: ' + JSON.stringify(ast, null, ' '));
  var js = generate(ast);
  console.log('JS program: ' + js);
  
  
  var stdlib = fs.readFileSync(path.join('js', 'stdlib.js'), 'utf8');
  
  return stdlib + js;
};

module.exports = compile;