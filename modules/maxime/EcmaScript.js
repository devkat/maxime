var EcmaScript = {};

var
  fs = require('fs'),
  filesystem = require('../lib/filesystem');

EcmaScript.array2list = function(a) {
  if (a.length === 0) {
    return new Maxime.scope.__maxime__List._List._Nil();
  }
  else {
    return new Maxime.scope.__maxime__List._List._Cons(a[0], EcmaScript.array2list(a.slice(1)));
  }
};

EcmaScript.mkString = function(s) {
  return new Maxime.scope.__maxime__String._String._String(s);
};

function toJson(o) {
  return JSON.stringify(o);
}

function regexp(str, mod) {
  return new RegExp(str, mod);
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

module.exports = EcmaScript;