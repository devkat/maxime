var
  _ = require('lodash'),
  Instance = require('./Instance');

function Constructor(scope, name, properties, methods) {
  this.scope = scope;
  this.name = name;
  this.properties = properties;
  this.methods = methods;
}

Constructor.prototype.getName = function() {
  return this.name;
};

Constructor.prototype.getClass = function() {
  return this.clazz;
};

Constructor.prototype.getProperty = function(name) {
  return _.find(this.properties, { name: name });
};

Constructor.prototype.getMethod = function(name) {
  return _.find(this.methods, { name: name });
};

Constructor.prototype.analyze = function(scope) {
  _.flatten([ this.properties, this.methods ]).forEach(function(member) {
    member.analyze();
  });
};

Constructor.prototype.getQualifiedName = function() {
  return this.scope.getQualifiedName();
};

Constructor.type = 'constructor';

module.exports = Constructor;
