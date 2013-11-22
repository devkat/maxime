var
  parse = require('./ast'),
  scope = require('./scope'),
  Type = require('./reflect/Type'),
  _ = require('lodash'),
  sprintf = require('sprintf'),
  fs = require('fs'),
  path = require('path'),
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
      scope.add(decl.loc, name, new Type());
    });
}

function analyze(src) {
  //var stdlib = fs.readFileSync(path.join('lib', 'stdlib', 'stdlib.max'), 'utf8');
  var input = fs.readFileSync(src, 'utf8');
  //var code = stdlib + '\n' + input;
  var code = input;
  var ast = parse(code, src);
  var scp = new scope.Scope();
  ast.analyze(scp);
  return {
    ast: ast,
    scope: scp
  };
}

module.exports = analyze;
