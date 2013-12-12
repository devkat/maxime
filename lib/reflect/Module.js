function Module(scope) {
  this.scope = scope;
}

Module.prototype.getScope = function() {
  return this.scope;
}

Module.type = 'module';

module.exports = Module;

