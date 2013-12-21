var
  _ = require('lodash'),
  ReflectRef = require('../reflect/Ref');

function Ref(name) {
  this.name = name;
};

Ref.prototype.toString = function() {
  return 'Ref';
};

Ref.prototype.populate = function(scope) {
  return new ReflectRef(scope, this.name.name, this.loc);
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