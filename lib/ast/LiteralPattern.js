function LiteralPattern(literal) {
  this.literal = literal;
}

LiteralPattern.prototype.getPattern = function() {
  return {
    type: 'literal',
    value: this.literal.value
  };
};


module.exports = 'LiteralPattern';
