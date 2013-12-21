var
  RefLiteral = require('../reflect/Literal');

function Literal(val) {
  this.value = val;
};

Literal.prototype.toString = function() {
  return 'Literal';
};

Literal.prototype.populate = function(scope) {
  return new RefLiteral(scope, this.value, this.loc);
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