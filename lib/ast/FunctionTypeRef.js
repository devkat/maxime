var
  _ = require('lodash'),
  FunctionType = require('../reflect/FunctionType');

function FunctionTypeRef(paramTypeRefs, returnTypeRef) {
  this.paramTypeRefs = paramTypeRefs;
  this.returnTypeRef = returnTypeRef;
}

FunctionTypeRef.prototype.toString = function() {
  return 'FunctionTypeRef';
};

FunctionTypeRef.prototype.analyze = function(scope) {
  function analyzeTypeRef(ref) {
    ref.analyze(scope);
    return ref.type;
  }
  var paramTypes = this.paramTypeRefs.map(analyzeTypeRef);
  var returnType = analyzeTypeRef(this.returnTypeRef);
  this.type = new FunctionType(paramTypes, returnType);
};

FunctionTypeRef.prototype.getType = function() {
  return this.type;
};

module.exports = FunctionTypeRef;
