function TypeParam(id, loc) {
  this.identifier = id;
  this.loc = loc;
};

TypeParam.prototype.toString = function() {
  return 'TypeParam';
};

TypeParam.prototype.print = function() {
  return this.identifier.print();
};

module.exports = TypeParam;