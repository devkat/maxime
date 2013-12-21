function LiteralPattern(literal) {
  this.literal = literal;
}

LiteralPattern.prototype.getPattern = function() {
  return {
    type: 'literal',
    value: this.literal.value
  };
};

LiteralPattern.prototype.populate = function() {
  return {
    analyze: function() {}
  };
};

module.exports = 'LiteralPattern';
