var
  _ = require('lodash'),
  Function = require('./Function');

function FunctionType(scope, paramTypeRefs, returnTypeRef) {
  this.scope = scope;
  this.paramTypeRefs = paramTypeRefs;
  this.returnTypeRef = returnTypeRef;
}

FunctionType.prototype.analyze = function() {
  this.paramTypeRefs.forEach(function(p) {
    p.analyze();
  });
  this.returnTypeRef.analyze();
};

FunctionType.prototype.getParamTypes = function() {
  this.analyze();
  return this.paramTypeRefs.map(function(p) {
    return p.getType();
  });
};

FunctionType.prototype.getReturnType = function() {
  this.analyze();
  return this.returnTypeRef.getType();
};

FunctionType.prototype.getType = function() {
  return this;
};

FunctionType.prototype.newRef = function() {
  return new Function(this);
};

module.exports = FunctionType;