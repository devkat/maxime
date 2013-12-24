var
  fs = require('fs'),
  filesystem = require('../lib/filesystem');

function array2list(a) {
  if (a.length === 0) {
    return new Maxime.scope.__maxime__List._List._Nil();
  }
  else {
    return new Maxime.scope.__maxime__List._List._Cons(a[0], array2list(a.slice(1)));
  }
}

function toJson(o) {
  return JSON.stringify(o);
}

function regexp(str, mod) {
  return new RegExp(str, mod);
}

function _findFiles(p, regex) {
  return array2list(filesystem.findFiles(p._s, regex).map(function(f) {
    return new Maxime.scope.__maxime__String._String._String(f);
  }));
}

function readFile(p) {
  return fs.readFileSync(p, 'utf-8');
}

function writeFile(p, content) {
  fs.writeFileSync(p, content);
}

function replace(str, regex, rep) {
  return str.replace(regex, rep);
}

function prop(obj, name) {
  return obj[name];
}
