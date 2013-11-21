var
  path = require('path'),
  fs = require('fs'),
  _ = require('lodash'),
  modules = {},
  chain = [];

function loadModule(src) {
  if (!modules[src]) {
    var filename = src + '.max';
    var analyze = require('./analyzer');
    var module = analyze(filename);
    modules[src] = module;
  }
  return modules[src];
}

function getModulePath(src) {
  return src.match(/^\./)
    ? src
    : path.join('modules', src);
}

function importModule(scope, src) {
  var absSrc = path.resolve(getModulePath(src));
  if (_.contains(chain, absSrc)) {
    throw 'Circular dependency: ' + chain.concat([absSrc]).join('\n → ');
  }
  chain.push(absSrc);
  var module = loadModule(absSrc);
  scope.merge(module.scope);
  chain.pop(absSrc);
  return module;
};

module.exports = {
  importModule: importModule
};
