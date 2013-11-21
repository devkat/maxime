var
  fs = require('fs'),
  path = require('path'),
  analyze = require('./analyzer'),
  generate = require('./generator'),
  prettyprint = require('./prettyprint'),
  sprintf = require('sprintf'),
  os = require('os');
  
var magenta = "\x1B[35m";
var yellow = "\x1B[33m";
var green = "\x1B[32m";
var red = "\x1B[31;1m";
var reset = "\x1B[0m";

function compile(src) {
  var result = analyze(src);
  var ast = result.ast;
  //console.log(sprintf("AST: %s--------------------%s%s%s--------------------", os.EOL, os.EOL, prettyprint(ast), os.EOL));
  //console.log(prettyprint(ast));
  var jsProg = generate(ast);
  console.log('JSPROG:\n' + jsProg);
  return jsProg;
};

module.exports = compile;