var
  _ = require('lodash'),
  Method = require('./Method'),
  Function = require('./Function');

function ClassVar(scope, name, typeParams, bounds, loc) {
  var that = this;
  
  this.scope = scope;
  this.name = name;
  this.typeParams = typeParams;
  this.bounds = bounds;
  this.loc = loc;
}

ClassVar.prototype.getName = function() {
  return this.name;
};

ClassVar.prototype.getQualifiedName = function() {
  return this.scope.getQualifiedName();
};

ClassVar.prototype.getMethod = function(name) {
  var methods = _.flatten(this.bounds.map(function(feature) {
    return feature.getType().methods.map(function(method) {
      var func = method.func;
      return new Method(
        method.scope,
        method.name,
        new Function(
          func.scope, func.typeParams, func.params, func.returnType, func.body
        )
      );
    });
  }));
  return _.find(methods, { name: name });
};

ClassVar.prototype.analyze = function() {
  var that = this;
  function analyze(p) {
    p.analyze(that.scope);
  }
  this.typeParams.forEach(analyze);
  this.bounds.forEach(analyze);
};

ClassVar.prototype.getType = function() {
  return this;
};

ClassVar.type = 'ClassVar';

module.exports = ClassVar;