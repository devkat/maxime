function Value(type) {
  this.type = type;
};

Value.prototype.getType = function() {
  return this.type;
};

Value.type = 'value';

module.exports = Value;
