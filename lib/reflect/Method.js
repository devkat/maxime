var transcode = require('../transcode');

function Method(clazz, name, params) {
  this.clazz = clazz;
  this.name = name;
  this.params = params;
}

module.exports = Method;