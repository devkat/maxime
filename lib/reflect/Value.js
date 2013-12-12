function Value() {
}

Value.prototype.getType = function() {
  return this.type;
};

Value.type = 'Value';

module.exports = Value;
