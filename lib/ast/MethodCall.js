var
  _ = require('lodash'),
  Function = require('../reflect/Function'),
  Class = require('../reflect/Class'),
  sprintf = require('sprintf'),
  report = require('../report');

function MethodCall(expr, name, args) {
  this.expr = expr;
  this.name = name;
  this.args = args;
};

MethodCall.prototype.toString = function() {
  return 'MethodCall';
};

MethodCall.prototype.populate = function(scope) {
  _.flatten([ this.expr, this.args ]).forEach(function(x) {
    x.populate(scope);
  });
  this.scope = scope;
};

MethodCall.prototype.analyze = function() {
  this.expr.analyze();
  var
    that = this,
    type = this.expr.getType();
    
  if (type.constructor === Class) {
    this.method = type.getMethod(this.name.name);
    if (!this.method) {
      report.error(this.loc, sprintf('Method %s.%s not found.', type.name, this.name.name));
    }
  }
  else {
    report.error(this.loc, "Only object methods can be accessed.");
  }
  
  this.args.forEach(function(arg) {
    arg.analyze();
  });
  
  // FIXME check args against params
};

MethodCall.prototype.getType = function(scope) {
  return this.method.getType().getReturnType();
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
    callee: this.name.transcode(),
    arguments: this.args.map(function(a) { return a.transcode(); })
  };
};

module.exports = MethodCall;