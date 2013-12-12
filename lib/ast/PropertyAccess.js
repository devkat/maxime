var
  sprintf = require('sprintf'),
  _ = require('lodash'),
  transcode = require('../transcode'),
  method = require('../reflect/Method'),
  Class = require('../reflect/Class'),
  report = require('../report');

function PropertyAccess(expr, propertyName) {
  this.expr = expr;
  this.propertyName = propertyName;
};

PropertyAccess.prototype.toString = function() {
  return 'PropertyAccess';
};

PropertyAccess.prototype.analyze = function(scope) {
  var
    propertyExpr = this.expr.analyze(scope),
    type = propertyExpr.getType();
    
  if (type.constructor === Class) {
    var ctor = _.find(type.getConstructors(), function(ctor) {
      return type.getName() === ctor.getName();
    });
    if (ctor) {
      var property = ctor.getProperty(this.propertyName.name);
      this.type = property.getType();
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
  return this.type;
};

PropertyAccess.prototype.print = function(ind) {
  return ind + sprintf('%s.%s(%s)',
    this.expr.print(),
    this.propertyName.print()
  );
};

PropertyAccess.prototype.transcode = function() {
  return {
    type: 'CallExpression',
    //callee: this.method.getJsFuncName(),
    callee: {
      type: 'MemberExpression',
      object: this.expr.transcode(),
      property: this.propertyName.transcode(),
      computed: false
    },
    arguments: []
  };
};

module.exports = PropertyAccess;