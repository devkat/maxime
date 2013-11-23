var
  Class = require('../reflect/Class');

function TypeParamRef(name) {
  this.name = name;
};

TypeParamRef.prototype.toString = function() {
  return 'TypeParamRef';
};

TypeParamRef.prototype.print = function() {
  return this.identifier.print();
};

TypeParamRef.prototype.analyze = function(scope) {
  this.type = scope.lookup(this.loc, this.name.name, Class);
};

TypeParamRef.prototype.getType = function() {
  return this.type;
};

module.exports = TypeParamRef;