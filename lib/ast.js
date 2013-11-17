var parser = require("./parser");
parser.lexer = require("./lexer");

module.exports = function(code) {
  return parser.parse(code);
};

parser.yy = require('./nodes');