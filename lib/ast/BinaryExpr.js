function BinaryExpr(left, operator, right) {
  this.left = left;
  this.operator = operator;
  this.right = right;
}

BinaryExpr.prototype.transcode = function() {
  return {
    type: 'BinaryExpression',
    left: this.left.transcode(),
    operator: this.operator,
    right: this.right.transcode()
  };
};

module.exports = BinaryExpr;
