var
  RefLiteral = require('../reflect/Literal'),
  transcode = require('../transcode');

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
  if (typeof this.value === 'string') {
    return {
      type: 'NewExpression',
      callee: transcode.get([ 'maxime.String', 'String', 'String' ]),
      arguments: [{
        type: 'Literal',
        value: this.value
      }]
    };
  };
  
  return {
    type: 'Literal',
    value: this.value
  };
};

module.exports = Literal;