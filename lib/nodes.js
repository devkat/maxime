var
  reflect = require('./reflect'),
  _ = require('lodash'),
  yy = {};

yy.src = {};

yy.src.loc = function(source, firstToken, lastToken) {
  return new yy.src.SourceLocation(source,
    new yy.src.Position(firstToken.first_line, firstToken.first_column),
    new yy.src.Position(lastToken.last_line, lastToken.last_column));
};

yy.src.SourceLocation = function(source, start, end) {
  this.source = source;
  this.start = start;
  this.end = end;
};

yy.src.Position = function(line, column) {
  this.line = line;
  this.column = column;
};

[
  'CtorCall',
  'CtorDecl',
  'DataDecl',
  'DefDecl',
  'FunctionCall',
  'FunctionParam',
  'Identifier',
  'Literal',
  'NativeExpr',
  'Program',
  'Ref',
  'TypeParam',
  'TypeParamRef',
  'TypeRef',
  'ValDecl'
].forEach(function(node) {
  yy[node] = require('./ast/' + node);
});

module.exports = yy;