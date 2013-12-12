function Property(name, type) {
  this.name = name;
  this.type = type;
}

Property.prototype.getType = function() {
  return this.type;
};

module.exports = Property;
