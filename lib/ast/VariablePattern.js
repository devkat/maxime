var
  Value = require('../reflect/Value');

function VariablePattern(name) {
  this.name = name;
}

VariablePattern.prototype.populate = function(scope) {
  // FIXME: Use ctor param type
  this.value = new Value(scope, {});
  scope.add(this.loc, this.name.name, this.value);
  return new ReflectVariablePattern(scope, this.value);
};

function ReflectVariablePattern(scope, value) {
  this.scope = scope;
  this.value = value;
}

ReflectVariablePattern.prototype.analyze = function(expr) {
  this.value.expr = expr;
};

ReflectVariablePattern.prototype.getType = function() {
  return this.expr.getType();
};

VariablePattern.prototype.getPattern = function() {
  return {
    type: 'variable',
    name: this.name.name
  };
};

module.exports = VariablePattern;
