var Lexer = require("lex");

var lexer = module.exports = new Lexer(function(char) {
  throw new Error("Unexpected character at yylineno " + this.yylineno + ", yycolno " + this.yycolno + ": " + char);
});

lexer.yylineno = 1;
lexer.yycolno = 1;
lexer.indent = [0];

// Multi-line comments
lexer.addRule(/\/\*(.|\n)*?\*\//, function(lexeme) {
  this.yylineno += lexeme.match(/\n/g).length;
});

// Single-line comments
lexer.addRule(/\/\/.*($|\r\n|\r|\n)/, function(lexeme) {
  this.yycolno = 1;
  this.yylineno += 1;
});

// Newline
lexer.addRule(/(\n\s*)*\n/, function(lexeme) {
  this.yycolno = 1;
  this.yylineno += lexeme.length;
  return "NEWLINE";
});

// Indentation
lexer.addRule(/^ */gm, function (lexeme) {
  var indentation = lexeme.length;
  this.yycolno += indentation;
  if (indentation > this.indent[0]) {
    this.indent.unshift(indentation);
    return "INDENT";
  }
  var tokens = [];
  while (indentation < this.indent[0]) {
    tokens.push("OUTDENT");
    this.indent.shift();
  }
  if (tokens.length) return tokens;
});

// Whitespace
lexer.addRule(/ +/, function (lexeme) {
  this.yycolno += lexeme.length;
});

// Numeric identifier
lexer.addRule(/[-\+]?\d+(?:\.\d+)?/, function (lexeme) {
  this.yytext = +lexeme;
  this.yycolno += lexeme.length;
  return "NUMERIC_LITERAL";
});

// Keywords
var keywordRegexp = /data|def|val/;
lexer.addRule(keywordRegexp, function(lexeme) {
  this.yycolno += lexeme.length;
  return keywordRegexp.exec(lexeme)[0].toUpperCase();
});

// Lowercase identifier
lexer.addRule(/[a-z][_a-zA-Z0-9]*/, function (lexeme) {
  this.yycolno += lexeme.length;
  this.yytext = lexeme;
  return "LC_IDENTIFIER";
});

// Uppercase identifier
lexer.addRule(/[A-Z][_a-zA-Z0-9]*/, function (lexeme) {
  this.yycolno += lexeme.length;
  this.yytext = lexeme;
  return "UC_IDENTIFIER";
});

// Backtick literal
lexer.addRule(/\`[^`]*\`/, function(lexeme) {
  this.yycolno += lexeme.length;
  this.yytext = lexeme.substring(1, lexeme.length - 1);
  return "BACKTICK_LITERAL";
});

// String literal
lexer.addRule(/\"[^"]*\"/, function(lexeme) {
  this.yycolno += lexeme.length;
  this.yytext = lexeme.substring(1, lexeme.length - 1);
  return "STRING_LITERAL";
});

// Misc characters
var miscCharRegexp = /[\(\)=\:\,\|]{1}/;
lexer.addRule(miscCharRegexp, function(lexeme) {
  this.yycolno += lexeme.length;
  return miscCharRegexp.exec(lexeme)[0];
});

// EOF
lexer.addRule(/$/, function () {
  return "EOF";
});




