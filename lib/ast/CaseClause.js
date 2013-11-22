function CaseClause(pattern, expr) {
  this.pattern = pattern;
  this.expr = expr;
}

CaseClause.prototype.toString = function() {
  return 'CaseClause';
};

CaseClause.prototype.print = function() {
  
};

module.exports = CaseClause;
