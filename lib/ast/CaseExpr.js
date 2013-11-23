var
  _ = require('lodash');

function CaseExpr(expr, clauses) {
  this.expr = expr;
  this.clauses = clauses;
}

CaseExpr.prototype.toString = function() {
  return 'CaseExpr';
};

CaseExpr.prototype.analyze = function(scope) {
};

CaseExpr.prototype.getType = function() {
  return this.type;
};

module.exports = CaseExpr;
