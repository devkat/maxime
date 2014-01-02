function IfExpr(testExpr, thenExpr, elseExpr) {
  this.testExpr = testExpr;
  this.thenExpr = thenExpr;
  this.elseExpr = elseExpr;
}

IfExpr.prototype.populate = function(scope) {
  return new ReflectIfExpr(
    this.testExpr.populate(scope),
    this.thenExpr.populate(scope),
    this.elseExpr.populate(scope)
  );
};

function ReflectIfExpr(testExpr, thenExpr, elseExpr) {
  this.testExpr = testExpr;
  this.thenExpr = thenExpr;
  this.elseExpr = elseExpr;
}

ReflectIfExpr.prototype.analyze = function() {
  this.testExpr.analyze();
  this.thenExpr.analyze();
  this.elseExpr.analyze();
};

module.exports = IfExpr;
