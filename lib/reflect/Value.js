function Value(type) {
  this.type = type;
}

Value.prototype.getType = function() {
  return this.type;
};

module.exports = Value;
