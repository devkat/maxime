function Literal(val) {
  this.value = val;
};

Literal.prototype.toString = function() {
  return 'Literal';
};

Literal.prototype.populate = function(scope) {
  this.scope = scope;
};

Literal.prototype.analyze = function() {
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