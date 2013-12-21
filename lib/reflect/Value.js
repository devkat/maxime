var
  _ = require('lodash');

function Value(scope, options) {
  this.scope = scope;
  this.typeRef = options.typeRef;
  this.expr = options.expr;
}

Value.prototype.analyze = function() {
  if (this.typeRef) {
    this.type = this.typeRef.getType();
  }
  else if (this.expr) {
    this.expr.analyze();
    this.type = this.expr.getType();
  }
};

Value.prototype.getType = function() {
  this.analyze();
  return this.type;
};

Value.type = 'Value';

module.exports = Value;
