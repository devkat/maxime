var
  Function = require('./Function');

function FunctionType(paramTypes, returnType) {
  this.paramTypes = paramTypes;
  this.returnType = returnType;
}

FunctionType.prototype.getParamTypes = function() {
  return this.paramTypes;
};

FunctionType.prototype.getReturnType = function() {
  return this.returnType;
};

FunctionType.prototype.newRef = function() {
  return new Function(this);
};

module.exports = FunctionType;