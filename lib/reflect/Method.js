var transcode = require('../transcode');

function Method(name, func) {
  this.name = name;
  this.func = func;
}

Method.prototype.getType = function() {
  return this.func.getType();
};

module.exports = Method;