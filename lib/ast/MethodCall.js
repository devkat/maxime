var
  sprintf = require('sprintf'),
  transcode = require('../transcode'),
  method = require('../reflect/Method'),
  Class = require('../reflect/Class');

function MethodCall(object, methodName, args) {
  this.object = object;
  this.methodName = methodName;
  this.args = args;
};

MethodCall.prototype.toString = function() {
  return 'MethodCall';
};

MethodCall.prototype.analyze = function(scope) {
  var clazz = scope.lookup(this.loc, this.className.name, Class);
  // FIXME check method existence
  this.args.forEach(function(arg) {
    arg.analyze(scope);
  });
};

MethodCall.prototype.print = function(ind) {
  return ind + sprintf('%s.%s(%s)',
    this.className.print(),
    this.methodName.print(),
    this.args.map(function(x) { return x.print(); }).join(', ')
  );
};

MethodCall.prototype.transcode = function() {
  return {
    type: 'CallExpression',
    callee: this.method.getJsFuncName(),
    arguments: this.args.map(function(a) { return a.transcode(); })
  };
};

MethodCall.prototype.transcodeAsStatement = function() {
  return {
    type: 'ExpressionStatement',
    expression: this.transcode()
  };
};

module.exports = MethodCall;