var
  transcode = require('../transcode'),
  Class = require('../reflect/Class');

function NativeExpr(expr) {
  this.expr = expr;
};

NativeExpr.prototype.toString = function() {
  return 'NativeExpr';
};

NativeExpr.prototype.populate = function(scope) {
  this.reflect = new ReflectNativeExpr(scope, this.expr, this.loc);
  return this.reflect;
};

NativeExpr.prototype.print = function(ind) {
  return '`' + this.expr + '`';
};

NativeExpr.prototype.transcode = function() {
  return this.reflect.ast;
};

function ReflectNativeExpr(scope, expr, loc) {
  this.scope = scope;
  this.expr = expr;
  this.loc = loc;
}

ReflectNativeExpr.prototype.analyze = function() {
  this.ast = transcode.query('Program ExpressionStatement @expression', transcode.reify(this.expr))[0];
  this.type = this.scope.lookup(this.loc, 'Void', Class);
};

ReflectNativeExpr.prototype.getType = function() {
  return this.type;
};

module.exports = NativeExpr;