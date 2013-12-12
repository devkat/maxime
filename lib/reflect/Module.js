function Module(scope, statements) {
  this.scope = scope;
  this.statements = statements;
}

Module.prototype.analyze = function() {
  var that = this;
  this.statements.forEach(function(stmt) {
    stmt.analyze(that.scope);
  });
};

Module.prototype.getScope = function() {
  return this.scope;
};

Module.type = 'module';

module.exports = Module;

