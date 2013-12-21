var
  _ = require('lodash'),
  Class = require('../reflect/Class');

function ClassType(scope, name, params) {
  this.scope = scope;
  this.name = name;
  this.params = params;
}

ClassType.prototype.analyze = function(scope) {
  this.clazz = this.scope.lookup(this.loc, this.name, Class);
  // FIXME check params
};

ClassType.prototype.getType = function() {
  this.analyze();
  return this.clazz;
};

module.exports = ClassType;
