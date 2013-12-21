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

FunctionTypeRef.prototype.populate = function(scope) {
  return new FunctionType(
    scope,
    this.paramTypeRefs.map(function(p) {
      return p.populate(scope);
    }),
    this.returnTypeRef.populate(scope)
  );
};

module.exports = FunctionTypeRef;
