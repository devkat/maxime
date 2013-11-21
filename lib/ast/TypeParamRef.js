function TypeParamRef(id) {
  this.identifier = id;
};

TypeParamRef.prototype.toString = function() {
  return 'TypeParamRef';
};

TypeParamRef.prototype.print = function() {
  return this.identifier.print();
};

module.exports = TypeParamRef;