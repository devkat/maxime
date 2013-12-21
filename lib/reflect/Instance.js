var
  _ = require('lodash'),
  Constructor = require('./Constructor');


function Instance(scope, ctorName, properties, loc) {
  this.scope = scope;
  this.ctorName = ctorName;
  this.properties = properties;
  this.loc = loc;
};

Instance.prototype.analyze = function() {
  this.ctor = this.scope.lookup(this.loc, this.ctorName, this.scope.namespace(Constructor));
};

Instance.prototype.getType = function() {
  this.analyze();
  return this.ctor.getClass();
};

Instance.prototype.getProperty = function(name) {
  var prop = this.properties[name];
  if (!prop) {
    throw new Error('Instance of ' + this.ctor.name + ' has no property "' + name + '".');
  }
};

module.exports = Instance;
