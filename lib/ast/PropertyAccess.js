var
  sprintf = require('sprintf'),
  transcode = require('../transcode'),
  method = require('../reflect/Method'),
  Class = require('../reflect/Class');

function PropertyAccess(expr, methodName, args) {
  this.expr = expr;
  this.methodName = methodName;
  this.args = args;
};

PropertyAccess.prototype.toString = function() {
  return 'PropertyAccess';
};

PropertyAccess.prototype.analyze = function(scope) {
  this.expr.analyze(scope);
  var type = this.expr.getType();
  
  if (type.constructor === Class) {
    // FIXME check method existence
    this.args.forEach(function(arg) {
      arg.analyze(scope);
    });
  }
  else {
    throw new Error("Methods can only be invoked on objects.");
  }
};

PropertyAccess.prototype.print = function(ind) {
  return ind + sprintf('%s.%s(%s)',
    this.className.print(),
    this.methodName.print(),
    this.args.map(function(x) { return x.print(); }).join(', ')
  );
};

PropertyAccess.prototype.transcode = function() {
  return {
    type: 'CallExpression',
    callee: this.method.getJsFuncName(),
    arguments: this.args.map(function(a) { return a.transcode(); })
  };
};

PropertyAccess.prototype.transcodeAsStatement = function() {
  return {
    type: 'ExpressionStatement',
    expression: this.transcode()
  };
};

module.exports = PropertyAccess;