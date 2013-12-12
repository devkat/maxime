var
  _ = require('lodash'),
  Class = require('../reflect/Class'),
  Type = require('../reflect/Type'),
  report = require('../report'),
  sprintf = require('sprintf');

function ClassDecl(name, typeParams, superClasses, ctorDecls) {
  this.name = name;
  this.typeParams = typeParams;
  this.superClasses = superClasses;
  this.ctorDecls = ctorDecls;
}

ClassDecl.prototype.populate = function(scope) {
  
  // Add class to current scope
  var className = this.name.name;
  var that = this;
  
  this.clazz = new Class(className, this.loc);
  scope.add(this.loc, className, this.clazz);
  
  var classScope = scope.createChildScope();

  _.flatten([this.typeParams, that.ctorDecls]).forEach(function(decl) {
    decl.populate(classScope);
  });
  
  var methods = _.zip(this.ctorDecls.map(function(ctorDecl) {
    return _.sortBy(ctorDecl.ctor.methods, 'name');
  }));
  
  this.clazz.methods = methods.map(function(tuple) {
    var name = _.pluck(_.compact(tuple), 'name').sort()[0];
    tuple.forEach(function(m, i) {
      if (!m || m.name !== name) {
        report.error(that.loc, sprintf('Constructor %s of class %s must define method %s.',
          that.ctorDecls[i].name.name,
          that.name.name,
          name));
      }
    });
    return tuple[0];
  });
  
  this.scope = classScope;
};

ClassDecl.prototype.analyze = function() {
  
  // Add type parameters to class scope
  this.typeParams.forEach(function(p) {
    p.analyze(this.scope);
  });

  // Analyze constructors
  this.clazz.constructors = this.ctorDecls.map(function(c) {
    return c.analyze(this.scope);
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