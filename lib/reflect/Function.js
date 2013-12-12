var
  _ = require('lodash');

function Function(scope, params, returnType, body) {
  this.scope = scope;
  this.params = params;
  this.returnType = returnType;
  this.body = body;
}

Function.prototype.analyze = _.once(function() {
  var that = this;
  // Analyze parameters and resolve types
  var paramTypes = this.params.map(function(p) {
    p.analyze(that.scope);
    return p.type;
  });
  
  // Analyze body
  this.body.analyze();

  var bodyType = this.body.getType();
  
  // FIXME check body type against declared return type
  
  this.type = new FunctionType(paramTypes, bodyType);
});

Function.prototype.getType = function() {
  this.analyze();
  return this.type;
};

Function.type = 'function';

module.exports = Function;
