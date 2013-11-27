function VariablePattern(name) {
  this.name = name;
}

VariablePattern.prototype.getPattern = function() {
  return {
    type: 'variable',
    name: this.name.name
  };
};

module.exports = VariablePattern;
