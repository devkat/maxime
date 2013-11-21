var Lexer = require("lex");
console.log("create lexer");
var lexer = module.exports = new Lexer(function(char) {
  throw new Error("Unexpected character at yylineno " + this.yylloc.first_line + ", yycolno " + this.yylloc.first_column + ": " + char);
});

lexer._setInput = lexer.setInput;
lexer.setInput = function(input) {
  this.yylineno = 1;
  this.yylloc = {
    first_line: 1,
    first_column: 0,
    last_line: 1,
    last_column: 0
  };
  this.indent = [0];
  this._setInput(input);
};

lexer.advance = function(lines, col) {
  this.yylloc = {
    first_line: this.yylloc.last_line,
    first_column: this.yylloc.last_column,
    last_line: this.yylloc.last_line + lines,
    last_column: col
  };
  this.yylineno += lines;
};

// Multi-line comments
lexer.addRule(/\/\*(.|\n)*?\*\//, function(lexeme) {
  var lines = lexeme.match(/\n/g).length - 1;
  this.advance(
    lines,
    lines.length === 0
      ? this.yylloc.last_column + lexeme.length
      : (function() {
        var lines = lexeme.split(/\n/);
        return lines[lines.length - 1].length;
      })()
  );
});

// Single-line comments
lexer.addRule(/\/\/.*($|\r\n|\r|\n)/, function(lexeme) {
  this.advance(1, 0);
});

// Newline(s)
lexer.addRule(/(\n\s*)*\n/, function(lexeme) {
  this.advance(lexeme.split(/\n/).length - 1, 0);
  return "NEWLINE";
});

// Indentation
lexer.addRule(/^ */gm, function (lexeme) {
  var indentation = lexeme.length;
  this.advance(0, indentation);
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
  this.advance(0, this.yylloc.last_column + lexeme.length);
});

// Numeric identifier
lexer.addRule(/[-\+]?\d+(?:\.\d+)?/, function (lexeme) {
  this.advance(0, this.yylloc.last_column + lexeme.length);
  this.yytext = +lexeme;
  return "NUMERIC_LITERAL";
});

// Keywords
var keywordRegexp = /data|def|import|val/;
lexer.addRule(keywordRegexp, function(lexeme) {
  this.advance(0, this.yylloc.last_column + lexeme.length);
  return keywordRegexp.exec(lexeme)[0].toUpperCase();
});

// Lowercase identifier
lexer.addRule(/[a-z][_a-zA-Z0-9]*/, function (lexeme) {
  this.advance(0, this.yylloc.last_column + lexeme.length);
  this.yytext = lexeme;
  return "LC_IDENTIFIER";
});

// Uppercase identifier
lexer.addRule(/[A-Z][_a-zA-Z0-9]*/, function (lexeme) {
  this.advance(0, this.yylloc.last_column + lexeme.length);
  this.yytext = lexeme;
  return "UC_IDENTIFIER";
});

// Backtick literal
lexer.addRule(/\`[^`]*\`/, function(lexeme) {
  this.advance(0, this.yylloc.last_column + lexeme.length);
  this.yytext = lexeme.substring(1, lexeme.length - 1);
  return "BACKTICK_LITERAL";
});

// String literal
lexer.addRule(/\"[^"]*\"/, function(lexeme) {
  this.advance(0, this.yylloc.last_column + lexeme.length);
  this.yytext = lexeme.substring(1, lexeme.length - 1);
  return "STRING_LITERAL";
});

// Misc characters
var miscCharRegexp = /[\(\)=\:\,\|]{1}/;
lexer.addRule(miscCharRegexp, function(lexeme) {
  this.advance(0, this.yylloc.last_column + lexeme.length);
  return miscCharRegexp.exec(lexeme)[0];
});

// EOF
lexer.addRule(/$/, function () {
  return "EOF";
});




