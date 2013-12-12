var transcode = require('../transcode');

function Method(scope, name, func) {
  this.scope = scope;
  this.name = name;
  this.func = func;
}

Method.prototype.analyze = function() {
  this.func.analyze();
};

Method.prototype.getType = function() {
  return this.func.getType();
};

module.exports = Method;