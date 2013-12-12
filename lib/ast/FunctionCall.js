var
  Function = require('../reflect/Function'),
  sprintf = require('sprintf');

function FunctionCall(name, args) {
  this.name = name;
  this.args = args;
};

FunctionCall.prototype.toString = function() {
  return 'FunctionCall';
};

FunctionCall.prototype.populate = function(scope) {
  this.scope = scope;
};

FunctionCall.prototype.analyze = function() {
  var scope = this.scope;
  this.func = scope.lookup(this.loc, this.name.name, scope.namespace(Function));
  this.args.forEach(function(arg) {
    arg.analyze(scope);
  });
};

FunctionCall.prototype.getType = function() {
  return this.func.getReturnType();
};

FunctionCall.prototype.print = function(ind) {
  return ind + sprintf('%s(%s)',
    this.name.print(),
    this.args.map(function(x) { return x.print(); }).join(', ')
  );
};

FunctionCall.prototype.transcode = function() {
  return {
    type: 'CallExpression',
    callee: this.name.transcode(),
    arguments: this.args.map(function(a) { return a.transcode(); })
  };
};

module.exports = FunctionCall;