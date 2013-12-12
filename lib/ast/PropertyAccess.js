var
  sprintf = require('sprintf'),
  _ = require('lodash'),
  transcode = require('../transcode'),
  method = require('../reflect/Method'),
  Class = require('../reflect/Class'),
  report = require('../report');

function PropertyAccess(expr, name) {
  this.expr = expr;
  this.name = name;
};

PropertyAccess.prototype.toString = function() {
  return 'PropertyAccess';
};

PropertyAccess.prototype.populate = function(scope) {
  this.scope = scope;
};

PropertyAccess.prototype.analyze = function() {
  this.expr.analyze();
  var type = this.expr.getType();
    
  if (type.constructor === Class) {
    var ctor = _.find(type.getConstructors(), function(ctor) {
      return type.getName() === ctor.getName();
    });
    if (ctor) {
      this.property = ctor.getProperty(this.name.name);
      if (!this.property) {
        report.error(this.loc, sprintf('Property %s.%s not found.', type.name, this.name.name));
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

PropertyAccess.prototype.print = function(ind) {
  return ind + sprintf('%s.%s(%s)',
    this.memberAccess.expr.print(),
    this.memberAccess.name.print()
  );
};

PropertyAccess.prototype.transcode = function() {
  return {
    type: 'CallExpression',
    //callee: this.method.getJsFuncName(),
    callee: {
      type: 'MemberExpression',
      object: this.memberAccess.expr.transcode(),
      property: this.memberAccess.name.transcode(),
      computed: false
    },
    arguments: []
  };
};

module.exports = PropertyAccess;