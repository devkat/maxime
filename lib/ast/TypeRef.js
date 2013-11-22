var
  Type = require('../reflect/Type'),
  Class = require('../reflect/Class');

function TypeRef(name, args) {
  this.name = name;
  this.args = args;
};

TypeRef.prototype.toString = function() {
  return 'TypeRef';
};

TypeRef.prototype.analyze = function(scope) {
  this.type = scope.lookup(this.loc, this.name.name, Class);
};

TypeRef.prototype.print = function(ind) {
  return this.name.print()
    + (this.args.length === 0 ? '' : ' ' + this.args.map(function(arg) {
      return arg.print();
    }));
};

TypeRef.prototype.transcode = function() {
  return this.name.transcode();
};

module.exports = TypeRef;