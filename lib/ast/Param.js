var
  Class = require('../reflect/Class'),
  Value = require('../reflect/Value');

function Param(name, typeRef) {
  this.name = name;
  this.typeRef = typeRef;
};

Param.prototype.toString = function() {
  return 'Param';
};

Param.prototype.analyze = function(scope) {
  this.typeRef.analyze(scope);
  scope.add(this.loc, this.name.name, new Value(this.typeRef.getType()));
};

Param.prototype.print = function(ind) {
  return this.name.print() + (
    this.typeRef ? ':' + this.typeRef.print() : ''
  );
};

Param.prototype.transcode = function() {
  return this.name.transcode();
};

module.exports = Param;