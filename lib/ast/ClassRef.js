var
  Class = require('../reflect/Class');

function ClassRef(name, args) {
  this.name = name;
  this.args = args;
};

ClassRef.prototype.toString = function() {
  return 'ClassRef';
};

ClassRef.prototype.analyze = function(scope) {
  this.clazz = scope.lookup(this.loc, this.name.name, Class);
};

ClassRef.prototype.print = function(ind) {
  return this.name.print()
    + (this.args.length === 0 ? '' : ' ' + this.args.map(function(arg) {
      return arg.print();
    }));
};

ClassRef.prototype.getType = function() {
  return this.clazz;
};

ClassRef.prototype.transcode = function() {
  return this.name.transcode();
};

module.exports = ClassRef;