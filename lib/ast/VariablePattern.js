var
  Value = require('../reflect/Value');

function VariablePattern(name) {
  this.name = name;
}

VariablePattern.prototype.populate = function(scope) {
  // FIXME: Use ctor param type
  this.value = new Value(scope);
  scope.add(this.loc, this.name.name, this.value);
  return new ReflectVariablePattern();
};

function ReflectVariablePattern() {
}

ReflectVariablePattern.prototype.analyze = function() {
  // FIXME
};

VariablePattern.prototype.getPattern = function() {
  return {
    type: 'variable',
    name: this.name.name
  };
};

module.exports = VariablePattern;
