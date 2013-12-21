var
  _ = require('lodash'),
  Function = require('../reflect/Function'),
  FunctionType = require('../reflect/FunctionType'),
  sprintf = require('sprintf');

function FunctionDecl(name, typeParams, params, returnTypeDecl, body) {
  this.name = name;
  this.typeParams = typeParams;
  this.params = params;
  this.returnTypeDecl = returnTypeDecl;
  this.body = body;
};

FunctionDecl.prototype.toString = function() {
  return 'FunctionDecl';
};

FunctionDecl.prototype.populate = function(scope) {
  // Create scope for function body
  var funcScope = scope.createChildScope();
  var func = new Function(
    funcScope,
    this.typeParams.map(function(p) {
      return p.populate(funcScope);
    }),
    this.params.map(function(p) {
      return p.populate(funcScope);
    }),
    this.returnTypeDecl.populate(funcScope),
    this.body ? this.body.populate(funcScope) : null
  );
  scope.add(this.loc, this.name.name, func);
  return func;
};

FunctionDecl.prototype.print = function(ind) {
  var newline = require('os').EOL;
  function print(x) { return x.print(); }
  return ind + sprintf('def %s(%s) = %s',
    this.name.print(),
    this.params.map(print).join(', '),
    this.body.print()
  ) + newline;
};

FunctionDecl.prototype.transcode = function() {
  return {
    type: 'FunctionDeclaration',
    id: this.name.transcode(),
    params: this.params.map(function(p) { return p.transcode(); }),
    body: {
      type: 'BlockStatement',
      body: this.body ? [{
        type: 'ReturnStatement',
        argument: this.body.transcode()
      }] : []
    }
  };
};

FunctionDecl.prototype.checkTypes = function() {
  
};

module.exports = FunctionDecl;