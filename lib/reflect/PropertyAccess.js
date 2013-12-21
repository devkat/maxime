var
  _ = require('lodash'),
  sprintf = require('sprintf'),
  report = require('../report'),
  Class = require('./Class');

function PropertyAccess(scope, expr, name, loc) {
  this.scope = scope;
  this.expr = expr;
  this.name = name;
  this.loc = loc;
}

PropertyAccess.prototype.analyze = function() {
  this.expr.analyze();
  var type = this.expr.getType();
    
  if (type.constructor === Class) {
    var ctor = _.find(type.getConstructors(), function(ctor) {
      return type.getName() === ctor.getName();
    });
    if (ctor) {
      this.property = ctor.getProperty(this.name);
      if (!this.property) {
        report.error(this.loc, sprintf('Property %s.%s not found.', type.name, this.name));
      }
    }
    else {
      report.error(this.loc, 'Property access only possible with same-name constructors.');
    }
  }
  else {
    report.error(this.loc, "Only object properties can be accessed.");
  }
};

PropertyAccess.prototype.getType = function() {
  return this.property.getType();
};

module.exports = PropertyAccess;