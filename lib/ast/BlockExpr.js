var
  _ = require('lodash'),
  transcode = require('../transcode'),
  report = require('../report');

function BlockExpr(statements) {
  this.statements = statements;
}

BlockExpr.analyze = function(scope) {
  this.statements.forEach(function(stmt) {
    stmt.analyze(funcScope);
  });
};

BlockExpr.prototype.print = function() {
  var newline = require('os').EOL;
  return this.statements.map(function(stmt) {
    return ind + stmt.print(ind);
  }).join(newline);
};

BlockExpr.prototype.analyze = function(scope) {
  this.statements.forEach(function(stmt) {
    stmt.analyze(scope);
  });
};

BlockExpr.prototype.getType = function(scope) {
  return this.statements[this.statements.length - 1].getType();
};

BlockExpr.prototype.transcode = function() {
  
  if (this.statements.length === 0) {
    report.error(this.loc, 'A block expression must contain at least one statement.');
  }

  var that = this;
  return this.statements.length === 1
    ? this.statements[0].transcode()
    : {
      type: 'CallExpression',
      callee: {
        type: 'FunctionExpression',
        params: [],
        body: {
          type: 'BlockStatement',
          body: _.flatten(that.statements.map(function(stmt, i) {
            return i < that.statements.length - 1
              ? transcode.asStatement(stmt.transcode())
              : {
                type: 'ReturnStatement',
                argument: stmt.transcode()
              };
          }))
        }
      },
      arguments: []
    };
};

module.exports = BlockExpr;