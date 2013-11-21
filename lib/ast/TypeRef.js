var
  reflect = require('../reflect');

function TypeRef(id, args, loc) {
  this.identifier = id;
  this.args = args;
  this.loc = loc;
};

TypeRef.prototype.toString = function() {
  return 'TypeRef';
};

TypeRef.prototype.analyze = function(scope) {
  scope.lookup(this.loc, this.identifier.name, reflect.Type);
};

TypeRef.prototype.print = function(ind) {
  return this.identifier.print()
    + (this.args.length === 0 ? '' : ' ' + this.args.map(function(arg) {
      return arg.print();
    }));
};

TypeRef.prototype.transcode = function() {
  return this.identifier.transcode();
};

module.exports = TypeRef;