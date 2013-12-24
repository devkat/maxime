var
  _ = require('lodash'),
  Function = require('../reflect/Function'),
  Class = require('../reflect/Class'),
  sprintf = require('sprintf'),
  report = require('../report'),
  transcode = require('../transcode'),
  RefMethodCall = require('../reflect/MethodCall');

function MethodCall(expr, name, args) {
  this.expr = expr;
  this.name = name;
  this.args = args;
};

MethodCall.prototype.toString = function() {
  return 'MethodCall';
};

MethodCall.prototype.populate = function(scope) {
  return new RefMethodCall(
    scope,
    this.expr.populate(scope),
    this.name.name,
    this.args.map(function(a) {
      return a.populate(scope);
    }),
    this.loc
  );
};

MethodCall.prototype.print = function(ind) {
  return ind + sprintf('%s(%s)',
    this.name.print(),
    this.args.map(function(x) { return x.print(); }).join(', ')
  );
};

MethodCall.prototype.transcode = function() {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: this.expr.transcode(),
      property: this.name.transcode()
    },
    arguments: this.args.map(function(a) { return a.transcode(); })
  };
};

module.exports = MethodCall;