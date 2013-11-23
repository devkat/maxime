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

TypeParam.prototype.analyze = function(scope) {
  var name = this.name.name;
  scope.add(this.loc, name, new Class(name));
};

module.exports = TypeParam;