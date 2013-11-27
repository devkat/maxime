var transcode = require('../transcode');

function NativeExpr(expr) {
  this.expr = expr;
};

NativeExpr.prototype.toString = function() {
  return 'NativeExpr';
};

NativeExpr.prototype.analyze = function(scope) {
  this.ast = transcode.query('Program ExpressionStatement @expression', transcode.reify(this.expr))[0];
};

NativeExpr.prototype.print = function(ind) {
  return '`' + this.expr + '`';
};

NativeExpr.prototype.transcode = function() {
  this.analyze();
  return this.ast;
};

module.exports = NativeExpr;