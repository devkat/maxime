var
  Value = require('../reflect/Value'),
  sprintf = require('sprintf');

function ValDecl(id, expr) {
  this.identifier = id;
  this.expr = expr;
};

ValDecl.prototype.toString = function() {
  return 'ValDecl';
};

ValDecl.prototype.analyze = function(scope) {
  var name = this.identifier.name;
  this.expr.analyze(scope);
  scope.add(this.loc, name, new Value(this.expr.getType()));
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