var
  _ = require('lodash'),
  Constructor = require('./Constructor');


function Instance(scope, ctorName, properties, loc) {
  this.scope = scope;
  this.ctorName = ctorName;
  this.properties = properties;
  this.loc = loc;
};

Instance.prototype.getConstructor = function() {
  if (!this.ctor) {
    this.ctor = this.scope.lookup(this.loc, this.ctorName, this.scope.namespace(Constructor));
  }
  return this.ctor;
};

Instance.prototype.analyze = function() {
  if (!this.analyzed) {
    this.analyzed = true;
    this.getConstructor();
    this.properties.forEach(function(p) {
      p.analyze();
    });
  }
};

Instance.prototype.getType = function() {
  return this.getConstructor().getClass();
};

Instance.prototype.getProperty = function(name) {
  var prop = this.properties[name];
  if (!prop) {
    throw new Error('Instance of ' + this.ctor.name + ' has no property "' + name + '".');
  }
};

module.exports = Instance;
