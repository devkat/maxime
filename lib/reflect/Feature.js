function Feature(scope, name, typeParam, methods) {
  this.scope = scope;
  this.name = name;
  this.typeParam = typeParam;
  this.methods = methods;
}

Feature.prototype.analyze = function() {
  var that = this;
  function analyze(p) {
    p.analyze(that.scope);
  }
  this.typeParam.analyze();
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