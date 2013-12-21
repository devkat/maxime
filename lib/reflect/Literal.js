var Class = require('./Class');

var classes = {
  number: 'Num',
  string: 'String'
};

function Literal(scope, value, loc) {
  this.scope = scope;
  this.value = value;
  this.loc = loc;
}

Literal.prototype.analyze = function() {
  var className = classes[typeof this.value];
  this.type = this.scope.lookup(this.loc, className, Class);
};

Literal.prototype.getType = function() {
  return this.type;
};

module.exports = Literal;