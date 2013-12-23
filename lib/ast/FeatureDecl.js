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
  
  var featureScope = scope.createChildScope(this.name.name);
  return new Feature(
    featureScope,
    this.name.name,
    this.typeParams.map(populate),
    this.methodDecls.map(populate)
  );
};

FeatureDecl.prototype.transcode = function(scope) {
};

module.exports = FeatureDecl;