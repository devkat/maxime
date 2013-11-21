var
  modules = require('../modules');

function Import(modules) {
  this.modules = modules;
};

Import.prototype.toString = function() {
  return 'Import';
};

Import.prototype.println = function() {
  return 'import ' + this.modules.map(function(m) { return m.print(); }).join(' ');
};

Import.prototype.analyze = function(scope) {
  this.moduleAsts = this.modules.map(function(literal) {
    var module = modules.importModule(scope, literal.value);
    return module.ast;
  });
};

Import.prototype.transcode = function() {
  return this.moduleAsts.map(function(ast) {
    return ast.transcode().body;
  });
};

module.exports = Import;
