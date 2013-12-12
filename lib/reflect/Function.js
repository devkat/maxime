function Function() {
}

Function.prototype.getType = function() {
  return this.type;
};

Function.type = 'function';

module.exports = Function;
