var
  _ = require('lodash'),
  transcode = require('../transcode');

function CaseClause(pattern, body) {
  this.pattern = pattern;
  this.body = body;
}

CaseClause.prototype.toString = function() {
  return 'CaseClause';
};

CaseClause.prototype.print = function() {
  
};

CaseClause.prototype.populate = function(scope, expr) {
  var clauseScope = scope.createChildScope('__caseClause', false);
  return new ReflectCaseClause(
    clauseScope,
    this.pattern.populate(clauseScope, expr),
    this.body.populate(clauseScope)
  );
};

function ReflectCaseClause(scope, pattern, body) {
  this.scope = scope;
  this.pattern = pattern;
  this.body = body;
}

ReflectCaseClause.prototype.analyze = function(expr) {
  this.pattern.analyze(expr);
  this.body.analyze();
};

ReflectCaseClause.prototype.getType = function() {
  return this.body.getType();
};

function getVariables(pattern) {
  switch (pattern.type) {
    case "wildcard": return [];
    case "variable": return [ pattern.name ];
    case "literal": return [];
    case "constructor": return _.flatten(pattern.params.map(getVariables));
    default: throw new Error("Unknown pattern type: " + pattern.type);
  }
}

CaseClause.prototype.transcode = function() {
  var pattern = this.pattern.getPattern();
  var patternAstProg = transcode.reify('var x = ' + JSON.stringify(pattern));
  var patternAst = transcode.query('Program VariableDeclaration VariableDeclarator @init', patternAstProg)[0];
  return {
    type: 'ObjectExpression',
    properties: [
      {
        key: { type: 'Identifier', name: 'pattern' },
        value: patternAst
      },
      {
        key: { type: 'Identifier', name: 'callback' },
        value: {
          type: 'FunctionExpression',
          params: getVariables(pattern).map(function(v) {
            return { type: 'Identifier', name: v };
          }),
          body: {
            type: 'BlockStatement',
            body: [{
              type: 'ReturnStatement',
              argument: this.body.transcode()
            }]
          }
        }
      }
    ]
  };
};

module.exports = CaseClause;
