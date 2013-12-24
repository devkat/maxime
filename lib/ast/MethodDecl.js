var
  _ = require('lodash'),
  sprintf = require('sprintf'),
  FunctionDecl = require('./FunctionDecl'),
  Class = require('../reflect/Class'),
  Method = require('../reflect/Method'),
  transcode = require('../transcode');

function MethodDecl(name, typeParams, params, returnTypeDecl, body) {
  this.funcDecl = new FunctionDecl(name, typeParams, params, returnTypeDecl, body);
};

MethodDecl.prototype.toString = function() {
  return 'MethodDecl';
};

MethodDecl.prototype.analyze = function(scope) {
  var clazz = scope.lookup(this.loc, this.className.name, Class);
  //var method = new Method(clazz, this.methodName);
  
  var methodScope = scope.createChildScope(this.name.name, false);
  this.params.forEach(function(p) {
    p.analyze(methodScope);
  });

  var methodName = transcode.methodName(this.className, this.name);
  
  var types = _.pluck(this.params, 'type');
  scope.add(this.loc, methodName, new Function(types));
  this.body.forEach(function(stmt) {
    stmt.analyze(methodScope);
  });
};

MethodDecl.prototype.print = function(ind) {
  var newline = require('os').EOL;
  function print(x) { return x.print(); }
  return ind + sprintf('def %s.%s(%s) = %s',
    this.className.print(),
    this.name.print(),
    this.params.map(print).join(', '),
    this.body.map(function(stmt) {
      return ind + stmt.print(ind);
    }).join(newline)
  ) + newline;
};

MethodDecl.prototype.getOwnerParam = function() {
  return new Param(new Identifier('__owner'), this.className);
}

MethodDecl.prototype.transcode = function() {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left: {
      type: 'MemberExpression',
      object: transcode.get(this.scope.getQualifiedName()),
      property: { type: 'Identifier', name: 'prototype' }
    },
    right: {
      type: 'FunctionExpression',
      params: this.getOwnerParam().concat(this.params).map(function(p) { return p.transcode(); }),
      body: this.body.transcode()
    }
  };
};

MethodDecl.prototype.checkTypes = function() {
  
};

module.exports = MethodDecl;