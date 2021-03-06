var
  Lexer = require("lex"),
  _ = require('lodash');

var lexer = module.exports = new Lexer(function(char) {
  throw new Error("Unexpected character at line " + this.yylloc.first_line + ", column " + this.yylloc.first_column + ": " + char);
});

lexer.log = function() {
  //this.debug = true;
  if (this.debug) {
    console.log.apply(null, arguments);
  }
};

lexer._setInput = lexer.setInput;
lexer.setInput = function(input) {
  this.yylineno = 0;
  this.yylloc = {
    first_line: 1,
    first_column: -1,
    last_line: 1,
    last_column: -1
  };
  this.indent = [0];
  this._setInput(input);
  this.tokens = [];
  this.lineStart = true;
  this.lineIndent = 0;
};

lexer.advance = function(lines, col) {
  this.yylloc = {
    first_line: this.yylloc.last_line,
    first_column: this.yylloc.last_column + 1,
    last_line: this.yylloc.last_line + lines,
    last_column: col
  };
  this.yylineno += lines;
};

lexer.addToken = function(token, merge) {
  var lastToken = this.tokens[this.tokens.length - 1];
  if (!merge || lastToken !== token) {
    this.log("Adding token " + token);
    this.tokens.push(token);
  }
};


lexer.calcIndent = function() {
  if (this.tokens.length > 0 && this.lineStart) {
    var indentation = this.lineIndent;
    //this.log("indentation: " + indentation);
    if (indentation > this.indent[0]) {
      this.indent.unshift(indentation);
      this.addToken("INDENT");
    }
    while (indentation < this.indent[0]) {
      this.addToken("OUTDENT");
      this.indent.shift();
    }
  }
};

lexer.flushTokens = function(token) {
  this.calcIndent();
  this.addToken(token);
  var tokens = this.tokens;
  this.tokens = [];
  this.log("Tokens ", tokens);
  this.lineStart = false;
  return tokens;
};

// Multi-line comments
lexer.addRule(/\/\*(.|\r|\n|\r\n)*?\*\//, function(lexeme) {
  var lines = lexeme.match(/\r|\n|\r\n/g).length;
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
lexer.addRule(/\/\/.*$/m, function(lexeme) {
  //this.advance(1, 0);
});

// Indentation
//lexer.addRule(/^ */m, function (lexeme) {
  /*
  var indentation = lexeme.length;
  this.advance(0, indentation);
  if (indentation > this.indent[0]) {
    this.indent.unshift(indentation);
    this.addIndentToken("INDENT");
  }
  while (indentation < this.indent[0]) {
    this.addIndentToken("OUTDENT");
    this.indent.shift();
  }
});
*/

// Newline(s)
lexer.addRule(/\r|\n|\r\n/m, function(lexeme) {
  this.lineStart = true;
  this.lineIndent = 0;
  this.advance(lexeme.split(/\n/).length - 1, 0);
  this.addToken("NEWLINE", true);
});

// Whitespace
lexer.addRule(/ +/, function (lexeme) {
  if (this.lineStart) {
    this.lineIndent += lexeme.length;
  }
  this.advance(0, this.yylloc.last_column + lexeme.length);
});

function operator(name) {
  return function(lexeme) {
    this.advance(0, this.yylloc.last_column + lexeme.length);
    this.yytext = lexeme;
    return this.flushTokens(name);
  };
}

lexer.addRule(/=>|⇒/, operator('DOUBLE_RIGHT_ARROW'));
lexer.addRule(/->|→/, operator('RIGHT_ARROW'));

// Numeric identifier
lexer.addRule(/[-\+]?\d+(?:\.\d+)?/, function (lexeme) {
  this.advance(0, this.yylloc.last_column + lexeme.length);
  this.yytext = +lexeme;
  return this.flushTokens("NUMERIC_LITERAL");
});

// Keywords
var keywordRegexp = /case|class|def|else|feature|if|import|is|match|then|val/;
lexer.addRule(keywordRegexp, function(lexeme) {
  this.advance(0, this.yylloc.last_column + lexeme.length);
  return this.flushTokens(keywordRegexp.exec(lexeme)[0].toUpperCase());
});

// Lowercase identifier
lexer.addRule(/[a-z][_a-zA-Z0-9]*/, function (lexeme) {
  this.advance(0, this.yylloc.last_column + lexeme.length);
  this.yytext = lexeme;
  return this.flushTokens("LC_IDENTIFIER");
});

// Uppercase identifier
lexer.addRule(/[A-Z][_a-zA-Z0-9]*/, function (lexeme) {
  this.advance(0, this.yylloc.last_column + lexeme.length);
  this.yytext = lexeme;
  return this.flushTokens("UC_IDENTIFIER");
});

// Backtick literal
lexer.addRule(/\`[^`]*\`/, function(lexeme) {
  this.advance(0, this.yylloc.last_column + lexeme.length);
  this.yytext = lexeme.substring(1, lexeme.length - 1);
  return this.flushTokens("BACKTICK_LITERAL");
});

// String literal
lexer.addRule(/\"[^"]*\"/, function(lexeme) {
  this.advance(0, this.yylloc.last_column + lexeme.length);
  this.yytext = lexeme.substring(1, lexeme.length - 1);
  return this.flushTokens("STRING_LITERAL");
});

// LAMBDA
lexer.addRule(/\\/, function(lexeme) {
  this.advance(0, this.yylloc.last_column + lexeme.length);
  return this.flushTokens("LAMBDA");
});

// Misc characters
var miscCharRegexp = /[\[\]\(\)\{\}=\:\,\.\|_]{1}/;
lexer.addRule(miscCharRegexp, function(lexeme) {
  this.advance(0, this.yylloc.last_column + lexeme.length);
  return this.flushTokens(miscCharRegexp.exec(lexeme)[0]);
});

// Operators
lexer.addRule(/[\+\*\-\/\%\&\=]+/, function(lexeme) {
  this.advance(0, this.yylloc.last_column + lexeme.length);
  this.yytext = lexeme;
  return this.flushTokens("OPERATOR");
});

// EOF
lexer.addRule(/$/, function () {
  return this.flushTokens("EOF");
});




