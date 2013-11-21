var
  reflect = require('../reflect'),
  sprintf = require('sprintf');

function ValDecl(id, expr, loc) {
  this.loc = loc,
  this.identifier = id;
  this.expr = expr;
};

ValDecl.prototype.toString = function() {
  return 'ValDecl';
};

ValDecl.prototype.analyze = function(scope) {
  var name = this.identifier.name;
  scope.add(this.loc, name, new reflect.Value());
  this.expr.analyze(scope);
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