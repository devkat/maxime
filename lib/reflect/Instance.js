function Instance(ctor, properties) {
  this.ctor = ctor;
  this.properties = properties;
};

Instance.prototype.getType = function() {
  return this.ctor.getClass();
};

Instance.prototype.getProperty = function(name) {
  var prop = this.properties[name];
  if (!prop) {
    throw new Error('Instance of ' + this.ctor.name + ' has no property "' + name + '".');
  }
};

module.exports = Instance;
