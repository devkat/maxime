var EcmaScript = {};

var
  _ = require('lodash'),
  fs = require('fs'),
  filesystem = require('../lib/filesystem');

EcmaScript.array2list = function(a) {
  if (a.length === 0) {
    return new Maxime.scope.__maxime__List._List._Nil();
  }
  else {
    return new Maxime.scope.__maxime__List._List._Cons(
      EcmaScript.js2max(a[0]),
      EcmaScript.array2list(a.slice(1))
    );
  }
};

EcmaScript.js2max = function(x) {
  if (typeof x._constructor === 'string') {
    return x;
  }
  if (_.isArray(x)) {
    return EcmaScript.array2list(x);
  }
  if (typeof x === 'string') {
    return new Maxime.scope.__maxime__String._String._String(x);
  }
  if (typeof x === 'number') {
    return new Maxime.scope.__maxime__Num._Num._Num(x);
  }
  if (typeof x === 'boolean') {
    return x
      ? new Maxime.scope.__maxime__Bool._Bool._True()
      : new Maxime.scope.__maxime__Bool._Bool._False();
  }
  throw new Error(JSON.stringify(x));
};

EcmaScript.max2js = function(x) {
  if (x.constructor === Maxime.scope.__maxime__List._List._Cons) {
    return [ EcmaScript.max2js(x._headElem) ].concat(EcmaScript.max2js(x._tailList));
  }
  if (x.constructor === Maxime.scope.__maxime__List._List._Nil) {
    return [];
  }
  if (x.constructor === Maxime.scope.__maxime__String._String._String) {
    return x._s;
  }
  throw new Error(JSON.stringify(x));
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