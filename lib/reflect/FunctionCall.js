var Function = require('./Function');

function FunctionCall(scope, name, args, loc) {
  this.scope = scope;
  this.name = name;
  this.args = args;
  this.loc = loc;
}

FunctionCall.prototype.analyze = function() {
  var scope = this.scope;
  var value = scope.lookup(this.loc, this.name, 'object');
  this.type = value.getType();
  this.args.forEach(function(arg) {
    arg.analyze(scope);
  });
};

FunctionCall.prototype.getType = function() {
  return this.type.getReturnType();
};

module.exports = FunctionCall;