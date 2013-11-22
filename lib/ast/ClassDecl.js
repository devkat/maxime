var
  _ = require('lodash'),
  Class = require('../reflect/Class'),
  Property = require('../reflect/Property'),
  Value = require('../reflect/Value'),
  Type = require('../reflect/Type');

function ClassDecl(name, typeParams, params, superClasses, body) {
  this.name = name;
  this.typeParams = typeParams;
  this.params = params;
  this.superClasses = superClasses;
  this.body = body;
}

ClassDecl.prototype.analyze = function(scope) {
  
  // Create class scope
  var classScope = scope.createChildScope();
  
  // Add type parameters as types to class scope
  this.typeParams.forEach(function(p) {
    classScope.add(p.loc, p.name, new Type());
  });

  // Analyze params, adding them as values to class scope
  this.params.forEach(function(p) {
    p.analyze(classScope);
  });

  // Analyze body statements
  this.body.forEach(function(stmt) {
    stmt.analyze(classScope);
  });
  
  // Create properties
  var properties = this.params.map(function(p) {
    return new Property(p.name.name, p.type);
  });
  
  // Add class to current scope
  var className = this.name.name;
  scope.add(this.loc, className, new Class(className, properties));
  
};

module.exports = ClassDecl;