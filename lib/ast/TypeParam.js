var
  Class = require('../reflect/Class');

function TypeParam(name) {
  this.name = name;
};

TypeParam.prototype.toString = function() {
  return 'TypeParam';
};

TypeParam.prototype.print = function() {
  return this.name.print();
};

TypeParam.prototype.populate = function(scope) {
  var name = this.name.name;
  scope.add(this.loc, name, new Class(name));
};

TypeParam.prototype.analyze = function() {
};

module.exports = TypeParam;