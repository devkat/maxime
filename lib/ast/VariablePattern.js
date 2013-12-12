var
  Value = require('../reflect/Value');

function VariablePattern(name) {
  this.name = name;
}

VariablePattern.prototype.populate = function(scope) {
  this.value = new Value();
  scope.add(this.loc, this.name.name, this.value);
};

VariablePattern.prototype.analyze = function() {
  // FIXME
};

VariablePattern.prototype.getPattern = function() {
  return {
    type: 'variable',
    name: this.name.name
  };
};

module.exports = VariablePattern;
