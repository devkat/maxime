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

Param.prototype.populate = function(scope) {
  this.scope = scope;
  this.value = new Value();
  this.scope.add(this.loc, this.name.name, this.value);
};

Param.prototype.analyze = function() {
  this.typeRef.analyze(this.scope);
  this.value.type = this.typeRef.getType();
};

Param.prototype.getType = function() {
  return this.typeRef.getType();
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