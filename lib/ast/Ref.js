var
  reflect = require('../reflect');

function Ref(id) {
  this.identifier = id;
};

Ref.prototype.toString = function() {
  return 'Ref';
};

Ref.prototype.analyze = function(scope) {
  scope.lookup(this.loc, this.identifier.name, reflect.Value);
};

Ref.prototype.print = function(ind) {
  return this.identifier.print();
};

Ref.prototype.transcode = function() {
  return this.identifier.transcode();
};

module.exports = Ref;