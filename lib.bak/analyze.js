var
  parse = require('./ast'),
  scope = require('./scope'),
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
      scope.add(decl.loc, name, new analyze.Type());
    });
}

analyze.Value = function(type) {
  this.type = type;
};
analyze.Value.type = 'value';

analyze.Function = function(types) {
  this.types = types;
};
analyze.Function.type = 'function';

analyze.Type = function() {
  
};
analyze.Type.type = 'type';

module.exports = function(code) {
  var ast = parse(code);
  ast.analyze(new scope.Scope());
};
