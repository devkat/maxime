var
  Class = require('../reflect/Class');

function ClassRef(name, args) {
  this.name = name;
  this.args = args;
};

ClassRef.prototype.toString = function() {
  return 'ClassRef';
};

ClassRef.prototype.populate = function(scope) {
  return new ReflectClassRef(
    scope,
    this.name.name,
    this.args.map(function(arg) {
      return arg.populate(scope);
    }),
    this.loc
  );
};

ClassRef.prototype.print = function(ind) {
  return this.name.print()
    + (this.args.length === 0 ? '' : ' ' + this.args.map(function(arg) {
      return arg.print();
    }));
};

ClassRef.prototype.transcode = function() {
  return this.name.transcode();
};


function ReflectClassRef(scope, name, params, loc) {
  this.scope = scope;
  this.name = name;
  this.params = params;
  this.loc = loc;
}

ReflectClassRef.prototype.analyze = function(scope) {
  this.clazz = this.scope.lookup(this.loc, this.name, 'type');
  // FIXME check params
};

ReflectClassRef.prototype.getType = function() {
  this.analyze();
  return this.clazz;
};

module.exports = ClassRef;