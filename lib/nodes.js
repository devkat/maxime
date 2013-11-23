var
  _ = require('lodash'),
  yy = {};

yy.start = function(file) {
  this.src.file = file;
};

yy.src = {};

yy.src.loc = function(firstToken, lastToken) {
  return new yy.src.SourceLocation(
    new yy.src.Position(firstToken.first_line, firstToken.first_column),
    new yy.src.Position(lastToken.last_line, lastToken.last_column));
};

yy.src.SourceLocation = function(file, start, end) {
  this.file = yy.src.file;
  this.start = start;
  this.end = end;
};

yy.src.Position = function(line, column) {
  this.line = line;
  this.column = column;
};

[
  'CaseClause',
  'CaseExpr',
  'ClassDecl',
  'ClassRef',
  'CtorCall',
  'CtorDecl',
  'FunctionCall',
  'FunctionDecl',
  'FunctionTypeRef',
  'Identifier',
  'Import',
  'Literal',
  'MethodDecl',
  'NativeExpr',
  'Param',
  'Pattern',
  'Program',
  'PropertyAccess',
  'Ref',
  'TypeParam',
  'TypeParamRef',
  'ValDecl',
  'Wildcard',
  'WildcardTypeRef'
].forEach(function(node) {
   yy[node] = require('./ast/' + node);
});

module.exports = yy;