var
  _ = require('lodash'),
  sprintf = require('sprintf'),
  transcode = require('../transcode'),
  ClassRef = require('./ClassRef'),
  Constructor = require('../reflect/Constructor'),
  Property = require('../reflect/Property'),
  Value = require('../reflect/Value'),
  Method = require('../reflect/Method');

function CtorDecl(name, params, methodDecls) {
  this.name = name;
  this.params = params;
  this.methodDecls = methodDecls;
};

CtorDecl.prototype.toString = function() {
  return 'CtorDecl';
};

CtorDecl.prototype.print = function(ind) {
  return sprintf('%s (%s)',
    this.name.print(),
    this.params.map(function(p) { return p.print(); }).join(', ')
  );
};

CtorDecl.prototype.populate = function(scope) {
  var that = this;
  // Create ctor scope
  this.scope = scope.createChildScope(this.name.name);
  
  // Create properties
  var properties = this.params.map(function(p) {
    return new Property(p.name.name, p.populate(that.scope));
  });
  
  // Create methods
  var methods = this.methodDecls.map(function(decl) {
    return new Method(that.scope, decl.name.name, decl.populate(that.scope));
  });
  
  var ctor = new Constructor(this.scope, this.name.name, properties, methods);
  scope.getParentScope().add(this.loc, this.name.name, ctor);
  return ctor;
};

CtorDecl.prototype.getQualifiedName = function() {
  return this.scope.getQualifiedName();
};

CtorDecl.prototype.transcode = function() {
  var that = this;
  
  function assignThis(property, expr) {
    return {
      type: 'ExpressionStatement',
      expression: {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: { type: 'ThisExpression' },
          property: { type: 'Identifier', name: property }
        },
        right: expr
      }
    };
  }
  
  function transcodeCtor() {
    return assignThis('constructor', {
      type: 'Literal',
      value: that.name.name
    });
  }
  
  function transcodeProperties() {
    return assignThis('properties', {
      type: 'ArrayExpression',
      elements: that.params.map(function(p) {
        return p.transcode();
      })
    });
  }
  
  function transcodeParam(param) {
    return assignThis(param.name.name, param.name.transcode());
  }
  
  return {
    key: this.name.transcode(),
    value: {
      type: 'CallExpression',
      callee: {
        type: 'FunctionExpression',
        params: [],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'VariableDeclaration',
            declarations: [{
              type: 'VariableDeclarator',
              id: this.name.transcode(),
              init: {
                type: 'FunctionExpression',
                params: this.params.map(function(p) { return p.name.transcode(); }),
                body: {
                  type: 'BlockStatement',
                  body: _.flatten([
                    transcodeCtor(),
                    transcodeProperties(),
                    this.params.map(transcodeParam)
                  ])
                }
              }
            }],
            kind: 'var'
          }]
          .concat(this.methodDecls.map(function(m) {
            return m.transcodeAsMethod(that.name);
          }))
          .concat([{
            type: 'ReturnStatement',
            argument: this.name.transcode()
          }])
        }
      },
      arguments: []
    }
  };
};

module.exports = CtorDecl;