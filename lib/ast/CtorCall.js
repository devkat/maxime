var
  sprintf = require('sprintf'),
  Class = require('../reflect/Class');

function CtorCall(name, args) {
  this.name = name;
  this.args = args;
};

CtorCall.prototype.toString = function() {
  return 'CtorCall';
};

CtorCall.prototype.analyze = function(scope) {
  this.clazz = scope.lookup(this.loc, this.name.name, Class);
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
    callee: this.name.transcode(),
    arguments: this.args.map(function(a) { return a.transcode(); })
  };
};

module.exports = CtorCall;