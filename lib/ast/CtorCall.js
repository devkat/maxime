var
  sprintf = require('sprintf');

function CtorCall(identifier, args, loc) {
  this.identifier = identifier;
  this.args = args;
  this.loc = loc;
};

CtorCall.prototype.toString = function() {
  return 'CtorCall';
};

CtorCall.prototype.analyze = function() {
  
};

CtorCall.prototype.print = function(ind) {
  return ind + sprintf('%s(%s)',
    this.identifier.print(),
    this.args.map(function(x) { return x.print(''); }).join(', ')
  );
};

CtorCall.prototype.transcode = function() {
  return {
    type: 'CallExpression',
    callee: this.identifier.transcode(),
    arguments: this.args.map(function(a) { return a.transcode(); })
  };
};

CtorCall.prototype.transcodeAsStatement = function() {
  return {
    type: 'ExpressionStatement',
    expression: this.transcode()
  };
};

module.exports = CtorCall;