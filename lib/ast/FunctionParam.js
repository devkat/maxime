var reflect = require('../reflect');

function FunctionParam(valId, typeId, loc) {
  this.loc = loc,
  this.valueIdentifier = valId;
  this.typeIdentifier = typeId;
};

FunctionParam.prototype.toString = function() {
  return 'Param';
};

FunctionParam.prototype.analyze = function(scope) {
  var type = scope.lookup(this.loc, this.typeIdentifier.name, reflect.Type);
  scope.add(this.loc, this.valueIdentifier.name, new reflect.Value(type));
};

FunctionParam.prototype.print = function(ind) {
  return this.valueIdentifier.print() + (
    this.typeIdentifier ? ':' + this.typeIdentifier.print() : ''
  );
};

FunctionParam.prototype.transcode = function() {
  return this.valueIdentifier.transcode();
};

module.exports = FunctionParam;