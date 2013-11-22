var
  report = require('./report'),
  Module = require('./reflect/Module'),
  Function = require('./reflect/Function'),
  Value = require('./reflect/Value'),
  Class = require('./reflect/Class'),
  Type = require('./reflect/Type'),
  sprintf = require('sprintf'),
  _ = require('lodash');

var namespaces = [ 'class', 'module', 'type', 'ref' ];

function ns(ctor) {
  switch (ctor) {
    case Module: return 'module';
    case Function: return 'ref';
    case Value: return 'ref';
    case Class: return 'class';
    case Type: return 'type';
    default: throw new Error("Unknown object constructor: " + ctor);
  }
}

function Scope(parentScope) {
  this.parentScope = parentScope;
  var objects = {};
  namespaces.forEach(function(ns) {
    objects[ns] = {};
  });
  this.objects = objects;
  
  this.add = function(loc, name, obj) {
    var objs = this.objects[ns(obj.constructor)];
    if (objs[name]) {
      report.error(loc, sprintf('%s %s is already defined.', obj.constructor.type, name));
    }
    else {
      objs[name] = {
        loc: loc,
        object: obj
      };
    }
  };
  
  /**
   * @param loc The location.
   * @param name The name of the object.
   * @param [Object] ctor The constructor of the expected object.
   */
  this.lookup = function(loc, name, ctor) {
    var record = this.objects[ns(ctor)][name];
    var obj = record
      ? record.object
      : (this.parentScope ? this.parentScope.lookup(loc, name, ctor) : undefined);
    if (!obj) {
      report.error(loc, sprintf('%s %s not found.', ctor ? ctor.type : 'reference', name));
    }
    if (ctor && (obj.constructor !== ctor)) {
      report.error(loc, sprintf('%s is not a %s.', name, ctor.type));
    }
    return obj;
  };
  
  this.existsInCurrentScope = function(name, ctor) {
    return this.objects[ns(ctor)][name] !== undefined;
  };
  
  this.createChildScope = function() {
    return new Scope(this);
  };
  
  this.getParentScope = function() {
    return parentScope;
  };
  
  this.merge = function(scope) {
    var that = this;
    _.each(_.pairs(scope.objects), function(pair) {
      var objects = pair[1];
      _.each(_.pairs(objects), function(pair) {
        var name = pair[0], obj = pair[1];
        //console.log("Importing " + name + " -> " + obj.object);
        that.add(obj.loc, name, obj.object);
      });
    });
  };
}

var scope = {};

scope.Scope = Scope;

module.exports = scope;
