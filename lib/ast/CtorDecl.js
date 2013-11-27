var
  _ = require('lodash'),
  sprintf = require('sprintf'),
  ClassRef = require('./ClassRef'),
  Property = require('../reflect/Property');

function CtorDecl(name, params) {
  this.name = name;
  this.params = params;
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

CtorDecl.prototype.analyze = function(scope) {
  // Create properties
  this.properties = this.params.map(function(p) {
    return new Property(p.name.name, p.type);
  });
  
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
        right: {
          type: 'FunctionExpression',
          params: [],
          body: {
            type: 'BlockStatement',
            body: [{
              type: 'ReturnStatement',
              argument: expr
            }]
          }
        }
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
    type: 'FunctionDeclaration',
    id: this.name.transcode(),
    params: this.params.map(function(p) { return p.name.transcode(); }),
    body: {
      type: 'BlockStatement',
      body: _.flatten([
        transcodeCtor(),
        transcodeProperties(),
        this.params.map(transcodeParam)
      ])
    }
  };
};

module.exports = CtorDecl;