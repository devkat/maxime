function Feature(name) {
  this.name = name;
}

Feature.prototype.getMethod = function(name) {
  var method = _.find(this.methods, { name: name });
  if (!method) {
    throw new Error(sprintf('Method %s.%s not found.', this.name, name));
  }
  return method;
};

module.exports = Feature;