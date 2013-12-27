var parser = require("../lib/parser");
parser.lexer = require("../lib/lexer");
parser.yy = require('../lib/nodes');

function parse(source) {
  var file = source.file();
  console.log('\n----\nParsing file ' + file);
  parser.yy.start(file);
  return parser.parse(source.code() + '\n');
}


