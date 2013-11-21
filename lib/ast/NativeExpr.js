var esprima = require('esprima');

function NativeExpr(expr, loc) {
  this.loc = loc;
  this.expr = expr;
};

NativeExpr.prototype.toString = function() {
  return 'NativeExpr';
};

NativeExpr.prototype.analyze = function(scope) {
  this.ast = esprima.parse(this.expr);
};

NativeExpr.prototype.print = function(ind) {
  return '`' + this.expr + '`';
};

NativeExpr.prototype.transcode = function() {
  return this.ast;
};

module.exports = NativeExpr;