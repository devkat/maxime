var
  _ = require('lodash'),
  Instance = require('./Instance');

function Constructor(name) {
  this.name = name;
}

Constructor.prototype.getName = function() {
  return this.name;
};

Constructor.prototype.getProperty = function(name) {
  return _.find(this.properties, { name: name });
};

Constructor.prototype.getMethod = function(name) {
  return _.find(this.methods, { name: name });
};

module.exports = Constructor;
