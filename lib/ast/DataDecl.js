var
  reflect = require('../reflect'),
  sprintf = require('sprintf');

function DataDecl(id, params, ctorDecls, loc) {
  this.loc = loc,
  this.identifier = id;
  this.params = params;
  this.ctorDecls = ctorDecls;
};

DataDecl.prototype.toString = function() {
  return 'DataDecl';
};

DataDecl.prototype.analyze = function(scope) {
  scope.add(this.loc, this.identifier.name, new reflect.Type());
};

DataDecl.prototype.print = function(ind) {
  function print(x) { return x.print(); }
  return ind + sprintf('type %s%s = %s',
    this.identifier.print(),
    this.params.length === 0 ? '' : ' ' + this.params.map(print).join(' '),
    this.ctorDecls.map(print).join(' | ')
  );
};

DataDecl.prototype.transcode = function() {
  return this.ctorDecls.map(function(x) { return x.transcode(); });
};

module.exports = DataDecl;