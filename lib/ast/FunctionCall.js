var
  Function = require('../reflect/Function'),
  sprintf = require('sprintf'),
  transcode = require('../transcode'),
  RefFunctionCall = require('../reflect/FunctionCall');

function FunctionCall(name, args) {
  this.name = name;
  this.args = args;
};

FunctionCall.prototype.toString = function() {
  return 'FunctionCall';
};

FunctionCall.prototype.populate = function(scope) {
  return new RefFunctionCall(
    scope,
    this.name.name,
    this.args.map(function(a) {
      return a.populate(scope);
    }),
    this.loc
  );
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
    callee: {
      type: 'Identifier',
      name: transcode.functionName(this.name.name)
    },
    arguments: this.args.map(function(a) { return a.transcode(); })
  };
};

module.exports = FunctionCall;