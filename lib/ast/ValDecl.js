var
  sprintf = require('sprintf'),
  Value = require('../reflect/Value');

function ValDecl(id, expr) {
  this.name = id;
  this.expr = expr;
};

ValDecl.prototype.toString = function() {
  return 'ValDecl';
};

ValDecl.prototype.populate = function(scope) {
  var value = new Value(scope, { expr: this.expr.populate(scope) });
  scope.add(this.loc, this.name.name, value);
  return value;
};

ValDecl.prototype.analyze = function() {
  this.expr.analyze(this.scope);
  this.value.type = this.expr.getType();
};

ValDecl.prototype.print = function(ind) {
  return ind + sprintf('val %s = %s',
    this.name.print(),
    this.expr.print('')
  );
};

ValDecl.prototype.transcode = function() {
  return {
    type: 'VariableDeclaration',
    kind: 'var',
    declarations: [{
      type: 'VariableDeclarator',
      id: this.name.transcode(),
      init: this.expr.transcode()
    }]
  };
};

ValDecl.prototype.transcodeAsMember = function() {
  return this.expr.transcode();
};

module.exports = ValDecl;