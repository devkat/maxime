var
  _ = require('lodash');

function Ref(name) {
  this.name = name;
};

Ref.prototype.toString = function() {
  return 'Ref';
};

Ref.prototype.populate = function(scope) {
  this.scope = scope;
};

Ref.prototype.analyze = function() {
  this.object = this.scope.lookup(this.loc, this.name.name, 'object');
};

Ref.prototype.getType = function() {
  return this.object.getType();
};

Ref.prototype.print = function(ind) {
  return this.name.print();
};

Ref.prototype.transcode = function() {
  return this.name.transcode();
};

module.exports = Ref;