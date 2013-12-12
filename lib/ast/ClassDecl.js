var
  _ = require('lodash'),
  Class = require('../reflect/Class'),
  Type = require('../reflect/Type');

function ClassDecl(name, typeParams, superClasses, ctorDecls, methodDecls) {
  this.name = name;
  this.typeParams = typeParams;
  this.superClasses = superClasses;
  this.ctorDecls = ctorDecls;
  this.methodDecls = methodDecls;
}

ClassDecl.prototype.analyze = function(scope) {
  
  // Add class to current scope
  var className = this.name.name;
  var clazz = new Class(className);
  scope.add(this.loc, className, clazz);
  
  // Create class scope
  var classScope = scope.createChildScope();
  
  // Add type parameters to class scope
  this.typeParams.forEach(function(p) {
    p.analyze(classScope);
  });

  // Analyze constructors
  clazz.constructors = this.ctorDecls.map(function(c) {
    return c.analyze(classScope);
  });

  // Analyze method declarations
  this.methodDecls.forEach(function(decl) {
    decl.analyze(classScope);
  });

};

ClassDecl.prototype.transcode = function(scope) {
  /*
    var paramIds = this.params.map(function(param, i) {
    if (param.constructor === ClassRef) {
      return param.name.transcode();
    }
    else {
      return {
        type: 'Identifier',
        name: param.name.name + '_' + i
      };
    }
  });
  */

  return _.flatten([ this.ctorDecls, this.methodDecls ]).map(function(x) {
    return x.transcode(scope + '.' + this.name.name);
  });
};

module.exports = ClassDecl;