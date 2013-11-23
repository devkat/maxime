var
  Function = require('./Function');

function FunctionType(paramTypes, returnType) {
  this.paramTypes = paramTypes;
  this.returnType = returnType;
}

FunctionType.prototype.newRef = function() {
  return new Function(this);
};

module.exports = FunctionType;