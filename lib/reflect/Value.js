function Value(scope, typeRef) {
  this.scope = scope;
  this.typeRef = typeRef;
}

Value.prototype.analyze = function() {
  this.typeRef.analyze();
};

Value.prototype.getType = function() {
  return this.typeRef.getType();
};

Value.type = 'Value';

module.exports = Value;
