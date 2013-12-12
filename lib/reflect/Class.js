var
  _ = require('lodash'),
  sprintf = require('sprintf'),
  report = require('../report');

function Class(scope, name, typeParams, ctors, methods, loc) {
  this.scope = scope;
  this.name = name;
  this.typeParams = typeParams;
  this.ctors = ctors;
  this.methods = methods;
  this.loc = loc;
}

Class.prototype.getName = function() {
  return this.name;
};

Class.prototype.getConstructors = function() {
  return this.ctors;
};

Class.prototype.getConstructor = function(name) {
  return _.find(this.ctors, { name: name });
};

Class.prototype.getMethod = function(name) {
  return _.find(this.methods, { name: name });
};

Class.prototype.analyze = function() {
  var that = this;
  
  // Add type parameters to class scope
  this.typeParams.forEach(function(p) {
    p.analyze(that.scope);
  });

  // Analyze constructors
  this.ctors.forEach(function(c) {
    c.analyze(that.scope);
  });

};

Class.type = 'Class';

module.exports = Class;
