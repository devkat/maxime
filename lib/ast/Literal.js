function Literal(val, loc) {
  this.loc = loc,
  this.value = val;
};

Literal.prototype.toString = function() {
  return 'Literal';
};

Literal.prototype.analyze = function(scope) {
};

Literal.prototype.print = function(ind) {
  return typeof this.value === 'string'
    ? '"' + this.value + '"'
    : this.value;
};

Literal.prototype.transcode = function() {
  return {
    type: 'Literal',
    value: this.value
  };
};

module.exports = Literal;