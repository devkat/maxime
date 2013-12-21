var
  _ = require('lodash');

function Ref(scope, name, loc) {
  this.scope = scope;
  this.name = name;
  this.loc = loc;
}

Ref.prototype.analyze = function() {
  this.object = this.scope.lookup(this.loc, this.name, 'object');
};

Ref.prototype.getType = function() {
  this.analyze();
  return this.object.getType();
};

module.exports = Ref;