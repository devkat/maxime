function Class(name) {
  this.name = name;
  this.constructors = [];
}

Class.prototype.getName = function() {
  return this.name;
};

Class.prototype.getConstructors = function() {
  return this.constructors;
};

module.exports = Class;
