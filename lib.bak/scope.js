var
  report = require('./report'),
  sprintf = require('sprintf');

function Scope(parentScope) {
  this.parentScope = parentScope;
  this.objects = {};
  
  this.add = function(loc, name, obj) {
    if (this.objects[name]) {
      report.error(loc, sprintf('%s %s is already defined.', obj.type, name));
    }
    this.objects[name] = obj;
  };
  
  /**
   * @param loc The location.
   * @param name The name of the object.
   * @param [Object] ctor The constructor of the expected object.
   */
  this.lookup = function(loc, name, ctor) {
    var obj = this.objects[name]
      || (this.parentScope ? this.parentScope.lookup(loc, name, ctor) : undefined);
    if (!obj) {
      report.error(loc, sprintf('%s %s not found.', ctor ? ctor.type : 'reference', name));
    }
    if (ctor && (obj.constructor !== ctor)) {
      report.error(loc, sprintf('%s is not a %s.', name, ctor.type));
    }
    return obj;
  };
  
  this.createChildScope = function() {
    var childScope = new Scope();
    childScope.parentScope = this;
    return childScope;
  };
}

var scope = {};

scope.Scope = Scope;

module.exports = scope;
