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

FunctionCall.prototype.analyze = function(scope) {
  scope.lookup(this.loc, this.name.name, scope.namespace(Function));
  this.args.forEach(function(arg) {
    arg.analyze(scope);
  });
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