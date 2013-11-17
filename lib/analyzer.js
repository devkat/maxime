var
  parse = require('./ast'),
  scope = require('./scope'),
  reflect = require('./reflect'),
  _ = require('lodash'),
  sprintf = require('sprintf'),
  report = require('./report');

function isA(ctor) {
  return function(n) { return n.constructor === ctor; };
}

function isNotA(ctor) {
  return function(n) { return n.constructor !== ctor; };
}

function resolveTypes(statements, scope) {
  statements
    .filter(isA(parser.ast.TypeDecl))
    .forEach(function(decl) {
      var name = decl.typeIdentifier.name;
      scope.add(decl.loc, name, new reflect.Type());
    });
}

function analyze(code) {
  var ast = parse(code);
  ast.analyze(new scope.Scope());
  return {
    ast: ast
  };
}

module.exports = analyze;
