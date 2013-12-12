var
  sprintf = require('sprintf'),
  Value = require('../reflect/Value');

function ValDecl(id, expr) {
  this.identifier = id;
  this.expr = expr;
};

ValDecl.prototype.toString = function() {
  return 'ValDecl';
};

ValDecl.prototype.populate = function(scope) {
  this.expr.populate(scope);
  this.value = new Value(scope, this.expr);
  scope.add(this.loc, this.identifier.name, this.value);
  this.scope = scope;
};

ValDecl.prototype.analyze = function() {
  this.expr.analyze(this.scope);
  this.value.type = this.expr.getType();
};

ValDecl.prototype.print = function(ind) {
  return ind + sprintf('val %s = %s',
    this.identifier.print(),
    this.expr.print('')
  );
};

ValDecl.prototype.transcode = function() {
  return {
    type: 'VariableDeclaration',
    kind: 'var',
    declarations: [{
      type: 'VariableDeclarator',
      id: this.identifier.transcode(),
      init: this.expr.transcode()
    }]
  };
};

module.exports = ValDecl;