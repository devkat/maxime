var
  _ = require('lodash'),
  Class = require('../reflect/Class'),
  Type = require('../reflect/Type'),
  Feature = require('../reflect/Feature');

function FeatureDecl(name, methodDecls) {
  this.name = name;
  this.methodDecls = methodDecls;
}

FeatureDecl.prototype.populate = function(scope) {
  // Create class scope
  var featureScope = scope.createChildScope();
  _.flatten(this.typeParams, this.methodDecls).forEach(function(decl) {
    decl.populate(featureScope);
  });
  
};

FeatureDecl.prototype.analyze = function(scope) {
  
  // Add class to current scope
  var featureName = this.name.name;
  var feature = new Feature();
  

  return clazz;
};

FeatureDecl.prototype.transcode = function(scope) {
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

module.exports = FeatureDecl;