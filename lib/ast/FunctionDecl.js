var
  _ = require('lodash'),
  Function = require('../reflect/Function'),
  FunctionType = require('../reflect/FunctionType'),
  sprintf = require('sprintf'),
  transcode = require('../transcode');

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
  this.scope = scope.createChildScope(this.name.transcode(), false);
  var that = this;
  var func = new Function(
    that.scope,
    this.typeParams.map(function(p) {
      return p.populate(that.scope);
    }),
    this.params.map(function(p) {
      return p.populate(that.scope);
    }),
    this.returnTypeDecl.populate(that.scope),
    this.body ? this.body.populate(that.scope) : null
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
    params: this.params.map(function(p) { return p.transcode(); }),
    body: {
      type: 'BlockStatement',
      body: this.body ? [{
        type: 'ReturnStatement',
        argument: this.body.transcode()
      }] : []
    }
  };
};

FunctionDecl.prototype.transcodeAsMember = function() {
  return {
    type: 'FunctionExpression',
    params: this.params.map(function(p) { return p.transcode(); }),
    body: {
      type: 'BlockStatement',
      body: this.body ? [{
        type: 'ReturnStatement',
        argument: this.body.transcode()
      }] : []
    }
  };
};

FunctionDecl.prototype.transcodeAsMethod = function(ctorName) {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'AssignmentExpression',
      operator: '=',
      left: {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: ctorName.transcode(),
          property: { type: 'Identifier', name: 'prototype' }
        },
        property: this.name.transcode()
      },
      right: {
        type: 'FunctionExpression',
        params: this.params.map(function(p) { return p.transcode(); }),
        body: {
          type: 'BlockStatement',
          body: this.body ? [{
            type: 'ReturnStatement',
            argument: this.body.transcode()
          }] : []
        }
      }
    }
  };
};

FunctionDecl.prototype.checkTypes = function() {
  
};

module.exports = FunctionDecl;