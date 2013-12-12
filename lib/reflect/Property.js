function Property(name, value) {
  this.name = name;
  this.value = value;
}

Property.prototype.analyze = function() {
};

Property.prototype.getType = function() {
  return this.value.getType();
};

module.exports = Property;
