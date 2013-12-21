var
  _ = require('lodash');

function Import(scope, modules, loc) {
  this.scope = scope;
  this.modules = modules;
  this.loc = loc;
}

Import.prototype.analyze = function() {
  var that = this;
  this.modules.forEach(function(name) {
    var module = that.scope.lookup(that.loc, name, 'module');
    module.analyze();
    that.scope.merge(module.getScope());
  });
  
  
  /*
  this.moduleAsts = this.modules.map(function(literal) {
    var module = modules.importModule(scope, literal.value);
    return module.ast;
  });
  */
};

module.exports = Import;
