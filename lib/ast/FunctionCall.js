var
  reflect = require('../reflect'),
  sprintf = require('sprintf');

function FunctionCall(identifier, args) {
  this.identifier = identifier;
  this.args = args;
};

FunctionCall.prototype.toString = function() {
  return 'FunctionCall';
};

FunctionCall.prototype.analyze = function(scope) {
  var name = this.identifier.name;
  scope.lookup(this.loc, name, reflect.Function);
  this.args.forEach(function(arg) {
    arg.analyze(scope);
  });
};

FunctionCall.prototype.print = function(ind) {
  return ind + sprintf('%s(%s)',
    this.identifier.print(),
    this.args.map(function(x) { return x.print(); }).join(', ')
  );
};

FunctionCall.prototype.transcode = function() {
  return {
    type: 'CallExpression',
    callee: this.identifier.transcode(),
    arguments: this.args.map(function(a) { return a.transcode(); })
  };
};

FunctionCall.prototype.transcodeAsStatement = function() {
  return {
    type: 'ExpressionStatement',
    expression: this.transcode()
  };
};

module.exports = FunctionCall;