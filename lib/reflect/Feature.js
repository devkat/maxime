function Feature(scope, name, typeParams, methods) {
  this.scope = scope;
  this.name = name;
  this.typeParams = typeParams;
  this.methods = methods;
}

Feature.prototype.analyze = function() {
  var that = this;
  function analyze(p) {
    p.analyze(that.scope);
  }
  this.typeParams.forEach(analyze);
  this.methods.forEach(analyze);
};

Feature.prototype.getMethod = function(name) {
  var method = _.find(this.methods, { name: name });
  if (!method) {
    throw new Error(sprintf('Method %s.%s not found.', this.name, name));
  }
  return method;
};

module.exports = Feature;