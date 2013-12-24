var
  ClassRef = require('./ClassRef'),
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
  var value = new Value(scope, { typeRef: this.typeRef.populate(scope) });
  scope.add(this.loc, this.name.name, value);
  return value;
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