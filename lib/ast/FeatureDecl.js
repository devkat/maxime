var
  _ = require('lodash'),
  Class = require('../reflect/Class'),
  Type = require('../reflect/Type'),
  Feature = require('../reflect/Feature');

function FeatureDecl(name, typeParams, methodDecls) {
  this.name = name;
  this.typeParams = typeParams;
  this.methodDecls = methodDecls;
}

FeatureDecl.prototype.populate = function(scope) {
  function populate(decl) {
    return decl.populate(featureScope);
  }
  
  var featureScope = scope.createChildScope();
  return new Feature(
    featureScope,
    this.name.name,
    this.typeParams.map(populate),
    this.methodDecls.map(populate)
  );
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