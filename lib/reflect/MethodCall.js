var
  Class = require('./Class'),
  ClassVar = require('./ClassVar'),
  report = require('../report'),
  sprintf = require('sprintf');

function MethodCall(scope, expr, name, args, loc) {
  this.scope = scope;
  this.expr = expr;
  this.name = name;
  this.args = args;
  this.loc = loc;
}

MethodCall.prototype.analyze = function() {
  this.expr.analyze();
  var
    that = this,
    type = this.expr.getType();
  if (type.constructor === Class || type.constructor === ClassVar) {
    this.method = type.getMethod(this.name);
    if (!this.method) {
      report.error(this.loc, sprintf('Method %s.%s not found.', type.name, this.name));
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

module.exports = MethodCall;
