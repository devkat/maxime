var
  report = require('./report'),
  Module = require('./reflect/Module'),
  Function = require('./reflect/Function'),
  Instance = require('./reflect/Instance'),
  Class = require('./reflect/Class'),
  Constructor = require('./reflect/Constructor'),
  Value = require('./reflect/Value'),
  Type = require('./reflect/Type'),
  Feature = require('./reflect/Feature'),
  sprintf = require('sprintf'),
  _ = require('lodash');

var
  namespaces = [ 'constructor', 'module', 'type', 'object' ],
  objectTypes = {
    constructor: 'Constructor',
    module: 'Module',
    type: 'Type',
    object: 'Object'
  };

function getObjectType(ns) {
  
}

function Scope(parentScope) {
  this.parentScope = parentScope;
  var objects = {};
  namespaces.forEach(function(ns) {
    objects[ns] = {};
  });
  this.objects = objects;
  
  this.add = function(loc, name, obj) {
    var objs = this.objects[this.namespace(obj.constructor)];
    if (objs.hasOwnProperty(name)) {
      report.error(loc, sprintf('%s %s is already defined.', obj.constructor.type, name));
    }
    else {
      objs[name] = {
        loc: loc,
        object: obj
      };
    }
  };
  
  this.namespace = function(ctor) {
    switch (ctor) {
      case Class: return 'type';
      case Constructor: return 'constructor';
      case Feature: return 'type';
      case Function: return 'object';
      case Instance: return 'object';
      case Module: return 'module';
      case Value: return 'object';
      default: throw new Error("Unknown object constructor: " + ctor);
    }
  };
  
  /**
   * @param loc The location.
   * @param name The name of the object.
   * @param {String|Object} namespace The namespace to look in, or the expected constructor.
   */
  this.lookup = function(loc, name, namespace) {
    
    var ctor;
    if (typeof namespace !== 'string') {
      ctor = namespace;
      namespace = this.namespace(ctor);
    }
    
    var record = this.objects[namespace][name];
    var obj = record
      ? record.object
      : (this.parentScope ? this.parentScope.lookup(loc, name, namespace) : undefined);
    if (!obj) {
      report.error(loc, sprintf('%s %s not found.', objectTypes[namespace], name));
    }
    if (ctor && (obj.constructor !== ctor)) {
      report.error(loc, sprintf('%s is not a %s.', name, ctor.type));
    }
    return obj;
  };
  
  this.existsInCurrentScope = function(name, namespace) {
    return this.objects[namespace][name] !== undefined;
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
