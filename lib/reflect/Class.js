var
  _ = require('lodash'),
  sprintf = require('sprintf'),
  report = require('../report');

function Class(name) {
  this.name = name;
}

Class.prototype.getName = function() {
  return this.name;
};

Class.prototype.getConstructors = function() {
  return this.constructors;
};

Class.prototype.geConstructor = function(name) {
  return _.find(this.constructors, { name: name });
};

Class.prototype.getMethod = function(name) {
  return _.find(this.methods, { name: name });
};

Class.type = 'Class';

module.exports = Class;
