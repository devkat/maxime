function Property(name, value) {
  this.name = name;
  this.value = value;
}

Property.prototype.getType = function() {
  return this.value.getType();
};

module.exports = Property;
