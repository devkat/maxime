var
  _ = require('lodash'),
  Instance = require('./Instance');

function Constructor(name, properties) {
  this.name = name;
  this.properties = properties;
}

Constructor.prototype.getName = function() {
  return this.name;
};

Constructor.prototype.getProperty = function(name) {
  return _.find(this.properties, { name: name });
};

module.exports = Constructor;
