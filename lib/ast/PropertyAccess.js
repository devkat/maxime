var
  sprintf = require('sprintf'),
  transcode = require('../transcode'),
  method = require('../reflect/Method'),
  Class = require('../reflect/Class');

function PropertyAccess(expr, propertyName) {
  this.expr = expr;
  this.propertyName = propertyName;
};

PropertyAccess.prototype.toString = function() {
  return 'PropertyAccess';
};

PropertyAccess.prototype.analyze = function(scope) {
  this.expr.analyze(scope);
  var type = this.expr.getType();
  
  if (type.constructor === Class) {
    // FIXME check method existence
    this.args.forEach(function(arg) {
      arg.analyze(scope);
    });
  }
  else {
    throw new Error("Methods can only be invoked on objects.");
  }
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