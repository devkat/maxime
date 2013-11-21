function TypeParam(id) {
  this.identifier = id;
};

TypeParam.prototype.toString = function() {
  return 'TypeParam';
};

TypeParam.prototype.print = function() {
  return this.identifier.print();
};

module.exports = TypeParam;