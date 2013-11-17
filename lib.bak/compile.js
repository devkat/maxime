var
  fs = require('fs'),
  path = require('path'),
  parser = require('../dist/parser').parser,
  analyze = require('./analyze'),
  infereTypes = require('./types'),
  generate = require('./generate'),
  prettyprint = require('./prettyprint'),
  sprintf = require('sprintf'),
  os = require('os');

function compile(input) {
  var stdlib = fs.readFileSync(path.join('lib', 'stdlib', 'stdlib.max'), 'utf8');
  var ast = parser.parse(stdlib + '\n' + input);
  var analyzeAst = analyze(ast);
  infereTypes(analyzeAst);
  console.log(sprintf("AST: %s--------------------%s%s%s--------------------", os.EOL, os.EOL, prettyprint(ast), os.EOL));
  //console.log(prettyprint(ast));
  var js = generate(analyzeAst);
  console.log('JS program: ' + js);
  
  var stdlib = fs.readFileSync(path.join('js', 'stdlib.js'), 'utf8');
  
  return stdlib + js;
};

module.exports = compile;