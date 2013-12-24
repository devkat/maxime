var
  ClassVar = require('../reflect/ClassVar');

function TypeParam(name, params, bounds) {
  this.name = name;
  this.params = params;
  this.bounds = bounds;
};

TypeParam.prototype.toString = function() {
  return 'TypeParam';
};

TypeParam.prototype.print = function() {
  return this.name.print();
};

TypeParam.prototype.populate = function(scope) {
  var name = this.name.name;
  
  function populate(d) {
    return d.populate(scope);
  }
  
  var clazz = new ClassVar(
    scope,
    name,
    this.params.map(populate),
    this.bounds.map(populate),
    this.loc);
  
  scope.add(this.loc, name, clazz);
  return clazz;
};

module.exports = TypeParam;