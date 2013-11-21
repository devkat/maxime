function TypeParamRef(id, loc) {
  this.identifier = id;
  this.loc = loc;
};

TypeParamRef.prototype.toString = function() {
  return 'TypeParamRef';
};

TypeParamRef.prototype.print = function() {
  return this.identifier.print();
};

module.exports = TypeParamRef;