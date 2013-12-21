var
  sprintf = require('sprintf'),
  transcode = require('../transcode'),
  Constructor = require('../reflect/Constructor'),
  Instance = require('../reflect/Instance');

function CtorCall(name, args) {
  this.name = name;
  this.args = args;
};

CtorCall.prototype.toString = function() {
  return 'CtorCall';
};

CtorCall.prototype.populate = function(scope) {
  this.scope = scope;
  return new Instance(
    scope,
    this.name.name,
    this.args.map(function(arg) {
      return arg.populate(scope);
    }),
    this.loc
  );
};

CtorCall.prototype.getType = function() {
  return this.instance.getType();
};

CtorCall.prototype.print = function(ind) {
  return ind + sprintf('%s(%s)',
    this.identifier.print(),
    this.args.map(function(x) { return x.print(''); }).join(', ')
  );
};

CtorCall.prototype.getType = function() {
  return this.clazz;
};

CtorCall.prototype.transcode = function() {
  return {
    type: 'NewExpression',
    callee: transcode.get(this.clazz.name + '.' + this.name.name),
    arguments: this.args.map(function(a) { return a.transcode(); })
  };
};

module.exports = CtorCall;