var
  _ = require('lodash');

function Block(scope, statements) {
  this.scope = scope;
  this.statements = statements;
}

Block.prototype.analyze = function() {
  this.statements.forEach(function(stmt) {
    stmt.analyze();
  });
};

Block.prototype.getType = function() {
  this.analyze();
  return this.statements[this.statements.length - 1].getType();
};


module.exports = Block;
