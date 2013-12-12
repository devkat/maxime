function BinaryExpr(left, operator, right) {
  this.left = left;
  this.operator = operator;
  this.right = right;
}

BinaryExpr.prototype.populate = function(scope) {
  this.left.populate(scope);
  this.right.populate(scope);
  this.scope = scope;
};

BinaryExpr.prototype.analyze = function() {
  [ this.left, this.right ].forEach(function(expr) {
    expr.analyze();
  });
};

BinaryExpr.prototype.transcode = function() {
  return {
    type: 'BinaryExpression',
    left: this.left.transcode(),
    operator: this.operator,
    right: this.right.transcode()
  };
};

module.exports = BinaryExpr;
