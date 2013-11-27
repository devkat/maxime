var
  _ = require('lodash'),
  transcode = require('../transcode');

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

CaseExpr.prototype.transcode = function() {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'Maxime'
      },
      property: {
        type: 'Identifier',
        name: 'patternMatch'
      }
    },
    arguments: [
      {
        type: 'ArrayExpression',
        elements: this.clauses.map(function(clause) {
          return clause.transcode();
        })
      },
      this.expr.transcode()
    ]
  };
};

module.exports = CaseExpr;
