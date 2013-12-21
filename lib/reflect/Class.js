var
  _ = require('lodash'),
  sprintf = require('sprintf'),
  report = require('../report');

function Class(scope, name, typeParams, ctors, methods, loc) {
  var that = this;
  
  this.scope = scope;
  this.name = name;
  this.typeParams = typeParams;
  
  this.ctors = ctors;
  this.ctors.forEach(function(c) {
    c.clazz = that;
  });
  
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
  function analyze(p) {
    p.analyze(that.scope);
  }
  this.typeParams.forEach(analyze);
  this.ctors.forEach(analyze);
};

Class.prototype.getType = function() {
  return this;
};

Class.type = 'Class';

module.exports = Class;
