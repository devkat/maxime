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

CaseExpr.prototype.populate = function(scope) {
  return new ReflectCaseExpr(
    this.scope,
    this.clauses.map(function(clause) {
      return clause.populate(scope);
    })
  );
};

function ReflectCaseExpr(scope, clauses) {
  this.scope = scope;
  this.clauses = clauses;
}

ReflectCaseExpr.prototype.analyze = function() {
  this.clauses.forEach(function(clause) {
    clause.analyze();
  });
};

ReflectCaseExpr.prototype.getType = function() {
  return this.clauses[0].getType();
};

CaseExpr.prototype.getType = function() {
  // FIXME unify clause types
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
