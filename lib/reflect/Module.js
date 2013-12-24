function Module(scope, name, statements) {
  this.scope = scope;
  this.name = name;
  this.statements = statements;
}

Module.prototype.analyze = function() {
  if (!this.analyzed) {
    var that = this;
    this.statements.forEach(function(stmt) {
      stmt.analyze();
    });
    this.analyzed = true;
  }
};

Module.prototype.getScope = function() {
  return this.scope;
};

Module.type = 'module';

module.exports = Module;

