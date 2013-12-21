var
  Value = require('../reflect/Value');

function LambdaExpr(params, expr) {
  this.params = params;
  this.expr = expr;
}

LambdaExpr.prototype.populate = function(scope) {
  var
    lambdaScope = scope.createChildScope(),
    that = this;
  return new ReflectLambdaExpr(
    scope,
    this.params.map(function(id) {
      var value = new Value(lambdaScope, {});
      scope.add(that.loc, id.name, value);
      return value;
    }),
    this.expr.populate(lambdaScope)
  );
};

function ReflectLambdaExpr(scope, params, expr) {
  this.scope = scope;
  this.params = params;
  this.expr = expr;
}

ReflectLambdaExpr.prototype.analyze = function() {
  this.params.forEach(function(p) {
    
  });
  this.expr.analyze(this.scope);
};

ReflectLambdaExpr.prototype.getType = function() {
  return this.expr.getType();
};

module.exports = LambdaExpr;