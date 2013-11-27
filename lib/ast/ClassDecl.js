var
  _ = require('lodash'),
  Class = require('../reflect/Class'),
  Value = require('../reflect/Value'),
  Type = require('../reflect/Type');

function ClassDecl(name, typeParams, superClasses, ctorDecls, methodDecls) {
  this.name = name;
  this.typeParams = typeParams;
  this.superClasses = superClasses;
  this.ctorDecls = ctorDecls;
  this.methodDecls = methodDecls;
}

ClassDecl.prototype.analyze = function(scope) {
  
  // Create class scope
  var classScope = scope.createChildScope();
  
  // Add type parameters to class scope
  this.typeParams.forEach(function(p) {
    p.analyze(classScope);
  });

  // Analyze params, adding them as values to class scope
  this.ctorDecls.forEach(function(c) {
    c.analyze(classScope);
  });

  // Analyze method declarations
  this.methodDecls.forEach(function(decl) {
    decl.analyze(classScope);
  });
  
  // Add class to current scope
  var className = this.name.name;
  scope.add(this.loc, className, new Class(className, properties));
  
};

ClassDecl.prototype.transcode = function() {
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
    return x.transcode();
  });
};

module.exports = ClassDecl;