function Property(scope, name, typeRef) {
  this.scope = scope;
  this.name = name;
  this.typeRef = typeRef;
}

Property.prototype.analyze = function() {
  this.type = this.typeRef.getType();
};

Property.prototype.getType = function() {
  return this.type;
};

Property.type = 'Property';

module.exports = Property;
