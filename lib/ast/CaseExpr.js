function CaseExpr(expr, clauses) {
  this.expr = expr;
  this.clauses = clauses;
}

CaseExpr.prototype.toString = function() {
  return 'CaseExpr';
};

module.exports = CaseExpr;
