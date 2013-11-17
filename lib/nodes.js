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

yy.analyze = {};

yy.CtorCall = function(identifier, args, loc) {
  this.loc = loc,
  this.identifier = identifier;
  this.args = args;
};

yy.CtorCall.prototype.toString = function() {
  return 'CtorCall';
};

yy.CtorCall.prototype.analyze = function() {
  
};

yy.DefDecl = function(id, params, body, loc) {
  this.loc = loc,
  this.identifier = id;
  this.params = params;
  this.body = body;
};

yy.DefDecl.prototype.toString = function() {
  return 'DefDecl';
};

yy.DefDecl.prototype.analyze = function(scope) {
  var funcScope = scope.createChildScope();
  var params = this.params.map(function(p) {
    return p.analyze(funcScope);
  });
  var types = _.pluck(params, 'type');
  scope.add(this.loc, this.identifier.name, new reflect.Function(types));
  var body = this.body.map(function(stmt) {
    return stmt.analyze(funcScope);
  });
  return new yy.DefDecl(
    new yy.Identifier(this.identifier.name),
    params,
    body
  );
};

yy.FunctionCall = function(identifier, args, loc) {
  this.loc = loc,
  this.identifier = identifier;
  this.args = args;
};

yy.FunctionCall.prototype.toString = function() {
  return 'FunctionCall';
};

yy.FunctionCall.prototype.analyze = function(scope) {
  var name = this.identifier.name;
  scope.lookup(this.loc, name, reflect.Function);
  return new yy.FunctionCall(
    new yy.Identifier(name),
    this.args.map(function(arg) {
      return arg.analyze(scope);
    })
  );
};

yy.Identifier = function(name, loc) {
  this.loc = loc,
  this.name = name;
};

yy.Identifier.prototype.toString = function() {
  return 'Identifier';
};

yy.Identifier.prototype.analyze = function(scope) {
  scope.lookup(this.loc, this.name);
  return new yy.Identifier(this.name);
};

yy.Literal = function(val, loc) {
  this.loc = loc,
  this.value = val;
};

yy.Literal.prototype.toString = function() {
  return 'Literal';
};

yy.Literal.prototype.analyze = function(scope) {
  return new yy.Literal(this.value);
};

yy.NativeExpr = function(expr, loc) {
  this.loc = loc;
  this.expr = expr;
};

yy.NativeExpr.prototype.toString = function() {
  return 'NativeExpr';
};

yy.NativeExpr.prototype.analyze = function(scope) {
  return new yy.NativeExpr(this.expr);
};

yy.Param = function(valId, typeId, loc) {
  this.loc = loc,
  this.valueIdentifier = valId;
  this.typeIdentifier = typeId;
};

yy.Param.prototype.toString = function() {
  return 'Param';
};

yy.Param.prototype.analyze = function(scope) {
  var type = scope.lookup(this.loc, this.typeIdentifier.name, reflect.Type);
  scope.add(this.loc, this.valueIdentifier.name, new reflect.Value(type));
  return new yy.Param(new yy.Identifier(this.valueIdentifier.name));
};

yy.Program = function(statements, loc) {
  this.loc = loc,
  this.statements = statements;
};

yy.Program.prototype.toString = function() {
  return 'Program';
};

yy.Program.prototype.analyze = function(scope) {
  this.statements.forEach(function(stmt) {
    stmt.analyze(scope);
  });
};

yy.TypeCtorDecl = function(id, args, loc) {
  this.identifier = id;
  this.args = args;
  this.loc = loc;
};

yy.TypeCtorDecl.prototype.toString = function() {
  return 'TypeCtorDecl';
};

yy.TypeDecl = function(typeId, loc) {
  this.loc = loc,
  this.typeIdentifier = typeId;
};

yy.TypeDecl.prototype.toString = function() {
  return 'TypeDecl';
};

yy.TypeDecl.prototype.analyze = function(scope) {
  var name = this.typeIdentifier.name;
  scope.add(this.loc, name, new reflect.Type());
};

yy.ValDecl = function(id, expr, loc) {
  this.loc = loc,
  this.identifier = id;
  this.expr = expr;
};

yy.ValDecl.prototype.toString = function() {
  return 'ValDecl';
};

yy.ValDecl.prototype.analyze = function(scope) {
  var name = this.identifier.name;
  scope.add(this.loc, name, new reflect.Value());
  this.expr.analyze(scope);
};

yy.Reference = function(id, loc) {
  this.loc = loc;
  this.identifier = id;
};

yy.Reference.prototype.toString = function() {
  return 'Reference';
};

yy.Reference.prototype.analyze = function(scope) {
  scope.lookup(this.loc, this.identifier.name, reflect.Value);
};

module.exports = yy;