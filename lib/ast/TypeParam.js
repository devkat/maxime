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
  var clazz = new Class(scope, name, [], [], [], this.loc);
  scope.add(this.loc, name, clazz);
  return clazz;
};

TypeParam.prototype.analyze = function() {
};

module.exports = TypeParam;