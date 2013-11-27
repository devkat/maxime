var
  path = require('path'),
  fs = require('fs'),
  _ = require('lodash'),
  modules = {},
  chain = [];

function loadModule(name, srcDir, destDir) {
  if (!modules[name]) {
    var compile = require('./compile');
    var module = compile(name, srcDir, destDir);
    modules[name] = module;
  }
  return modules[name];
}

/*
function getModulePath(src) {
  return src.match(/^\./)
    ? src
    : path.join('modules', src);
}
*/

function importModule(scope, name) {
  if (_.contains(chain, name)) {
    throw 'Circular dependency: ' + chain.concat([name]).join('\n → ');
  }
  chain.push(name);
  var module = loadModule(name);
  scope.merge(module.scope);
  chain.pop(name);
  return module;
};

module.exports = {
  loadModule: loadModule,
  importModule: importModule
};
