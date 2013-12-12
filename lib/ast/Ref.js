var
  _ = require('lodash');

function Ref(name) {
  this.name = name;
};

Ref.prototype.toString = function() {
  return 'Ref';
};

Ref.prototype.analyze = _.once(function(scope) {
  return scope.lookup(this.loc, this.name.name, 'object');
});

Ref.prototype.print = function(ind) {
  return this.name.print();
};

Ref.prototype.transcode = function() {
  return this.name.transcode();
};

module.exports = Ref;