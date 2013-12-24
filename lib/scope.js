var
  report = require('./report'),
  Module = require('./reflect/Module'),
  Function = require('./reflect/Function'),
  Instance = require('./reflect/Instance'),
  Class = require('./reflect/Class'),
  ClassVar = require('./reflect/ClassVar'),
  Constructor = require('./reflect/Constructor'),
  Value = require('./reflect/Value'),
  Type = require('./reflect/Type'),
  Feature = require('./reflect/Feature'),
  Property = require('./reflect/Property'),
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

function Scope(name, parentScope, inherit) {
  this.name = name;
  this.parentScope = parentScope;
  this.mergedScopes = [];
  this.inherit = inherit;
  
  var objects = {};
  namespaces.forEach(function(ns) {
    objects[ns] = [];
  });
  this.objects = objects;
  
  this.add = function(loc, name, obj) {
    var objs = this.objects[this.namespace(obj.constructor)];
    if (_.find(objs, { name: name })) {
      report.error(loc, sprintf('%s %s is already defined.', obj.constructor.type, name));
    }
    else {
      objs.push({
        name: name,
        loc: loc,
        object: obj
      });
    }
  };
  
  this.namespace = function(ctor) {
    switch (ctor) {
      case Class: return 'type';
      case ClassVar: return 'type';
      case Constructor: return 'constructor';
      case Feature: return 'type';
      case Function: return 'object';
      case Instance: return 'object';
      case Module: return 'module';
      case Value: return 'object';
      case Property: return 'object';
      default: throw new Error("Unknown object constructor: " + ctor);
    }
  };
  
  this.lookupInParents = function(loc, name, namespace) {
    var scopes = this.mergedScopes.concat(this.parentScope ? [ this.parentScope ] : []);
    return scopes.reduce(function(prev, scp) {
      return prev || scp.lookupLenient(loc, name, namespace);
    }, null);
  };
  
  this.lookupLenient = function(loc, name, namespace) {
    var ctor;
    if (typeof namespace !== 'string') {
      ctor = namespace;
      namespace = this.namespace(ctor);
    }
    
    var record = _.find(this.objects[namespace], { name: name });
    return record
      ? record.object
      : this.lookupInParents(loc, name, namespace);
  };
  
  /**
   * @param loc The location.
   * @param name The name of the object.
   * @param {String|Object} namespace The namespace to look in, or the expected constructor.
   */
  this.lookup = function(loc, name, namespace) {
    if (name === 'toString' && this.name === 'compileUnit') debugger;
    var obj = this.lookupLenient(loc, name, namespace);
    
    var ctor;
    if (typeof namespace !== 'string') {
      ctor = namespace;
      namespace = this.namespace(ctor);
    }
    
    if (!obj) {
      report.error(loc, sprintf('%s %s not found.', objectTypes[namespace], name));
    }
    
    if (ctor && (obj.constructor !== ctor)) {
      report.error(loc, sprintf('%s %s is not a %s.', obj.constructor.type, name, ctor.type));
    }
    return obj;
  };
  
  this.existsInCurrentScope = function(name, namespace) {
    return this.objects[namespace][name] !== undefined;
  };
  
  this.createChildScope = function(name, inherit) {
    return new Scope(this.inherit ? this.name + '.' + name : name, this, inherit);
  };
  
  this.getParentScope = function() {
    return parentScope;
  };
  
  this.merge = function(scope) {
    this.mergedScopes.push(scope);
    /*
    var that = this;
    _.each(_.pairs(scope.objects), function(pair) {
      var objects = pair[1];
      _.each(_.pairs(objects), function(pair) {
        var name = pair[0], obj = pair[1];
        that.add(obj.loc, name, obj.object);
      });
    });
    */
  };
}

Scope.prototype.getQualifiedName = function() {
  return this.name;
};

var scope = {};

scope.Scope = Scope;

module.exports = scope;
