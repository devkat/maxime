function BinaryExpr(left, operator, right) {
  this.left = left;
  this.operator = operator;
  this.right = right;
}

BinaryExpr.prototype.populate = function(scope) {
  return new ReflectBinaryExpr(
    this.scope,
    this.left.populate(scope),
    this.right.populate(scope)
  );
};

BinaryExpr.prototype.transcode = function() {
  return {
    type: 'BinaryExpression',
    left: this.left.transcode(),
    operator: this.operator,
    right: this.right.transcode()
  };
};

function ReflectBinaryExpr(scope, left, right) {
  this.scope = scope;
  this.left = left;
  this.right = right;
}

ReflectBinaryExpr.prototype.analyze = function() {
  [ this.left, this.right ].forEach(function(expr) {
    expr.analyze();
  });
};

ReflectBinaryExpr.prototype.getType = function() {
  
};

module.exports = BinaryExpr;
