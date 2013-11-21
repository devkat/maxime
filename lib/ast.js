var parser = require("./parser");
parser.lexer = require("./lexer");
parser.yy = require('./nodes');

module.exports = function(code, src) {
  parser.yy.start(src);
  return parser.parse(code + '\n');
};

