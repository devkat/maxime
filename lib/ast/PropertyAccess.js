var
  sprintf = require('sprintf'),
  _ = require('lodash'),
  transcode = require('../transcode'),
  method = require('../reflect/Method'),
  Class = require('../reflect/Class'),
  ReflectPropertyAccess = require('../reflect/PropertyAccess'),
  report = require('../report');

function PropertyAccess(expr, name) {
  this.expr = expr;
  this.name = name;
};

PropertyAccess.prototype.toString = function() {
  return 'PropertyAccess';
};

PropertyAccess.prototype.populate = function(scope) {
  return new ReflectPropertyAccess(
    scope,
    this.expr.populate(scope),
    this.name.name,
    this.loc
  );
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
      object: this.expr.transcode(),
      property: this.name.transcode(),
      computed: false
    },
    arguments: []
  };
};

module.exports = PropertyAccess;