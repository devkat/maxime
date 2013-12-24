var
  RefLiteral = require('../reflect/Literal'),
  transcode = require('../transcode'),
  sprintf = require('sprintf');

var classes = { string: 'String', number: 'Num'};

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
  var clazz = classes[typeof this.value];
  return {
    type: 'NewExpression',
    callee: transcode.get(sprintf('Maxime.scope.__maxime__%s._%s._%s', clazz, clazz, clazz)),
    arguments: [{
      type: 'Literal',
      value: this.value
    }]
  };
};

module.exports = Literal;