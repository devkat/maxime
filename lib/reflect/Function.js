var
  _ = require('lodash'),
  FunctionType = require('./FunctionType');

function Function(scope, typeParams, params, returnType, body) {
  this.scope = scope;
  this.typeParams = typeParams;
  this.params = params;
  this.returnType = returnType;
  this.body = body;
}

Function.prototype.analyze = function() {
  var that = this;
  
  // Analyze parameters and resolve types
  var paramTypes = this.params.map(function(p) {
    p.analyze(that.scope);
    return p.type;
  });
  
  // Analyze body
  if (this.body) {
    this.body.analyze();
    var bodyType = this.body.getType();
  }
  
  // FIXME check body type against declared return type
  
  this.type = new FunctionType(this.scope, paramTypes, this.returnType || bodyType);
};

Function.prototype.getType = function() {
  this.analyze();
  return this.type;
};

Function.type = 'function';

module.exports = Function;
