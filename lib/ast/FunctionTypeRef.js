function FunctionTypeRef(paramTypes, returnType) {
  this.paramTypeRefs = paramTypes;
  this.returnTypeRef = returnType;
}

FunctionTypeRef.toString = function() {
  return 'FunctionTypeRef';
};

FunctionTypeRef.analyze = function(scope) {
  function analyzeTypeRef(ref) {
    ref.analyze(scope);
    return ref.type;
  }
  this.paramTypes = this.paramTypeRefs.map(analyzeTypeRef);
  this.returnType = analyzeTypeRef(this.returnTypeRef);
};

module.exports = FunctionTypeRef;
