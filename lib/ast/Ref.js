var
  _ = require('lodash'),
  Value = require('../reflect/Value');

function Ref(name) {
  this.name = name;
};

Ref.prototype.toString = function() {
  return 'Ref';
};

Ref.prototype.analyze = function(scope) {
  this.value = scope.lookup(this.loc, this.name.name, Value);
};

Ref.prototype.getType = function() {
  return this.value.getType();
};

Ref.prototype.print = function(ind) {
  return this.name.print();
};

Ref.prototype.transcode = function() {
  return this.name.transcode();
};

module.exports = Ref;