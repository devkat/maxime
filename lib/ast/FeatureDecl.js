var
  _ = require('lodash'),
  Class = require('../reflect/Class'),
  Type = require('../reflect/Type'),
  Feature = require('../reflect/Feature'),
  Method = require('../reflect/Method');

function FeatureDecl(name, typeParam, methodDecls) {
  this.name = name;
  this.typeParam = typeParam;
  this.methodDecls = methodDecls;
}

FeatureDecl.prototype.populate = function(scope) {
  var featureScope = scope.createChildScope(this.name.name, false);
  
  var feature = new Feature(
    featureScope,
    this.name.name,
    this.typeParam.populate(featureScope),
    this.methodDecls.map(function(decl) {
      return new Method(featureScope, decl.name.name, decl.populate(featureScope));
    })
  );
  scope.add(this.loc, this.name.name, feature);
  return feature;
};

FeatureDecl.prototype.transcode = function(scope) {
};

module.exports = FeatureDecl;