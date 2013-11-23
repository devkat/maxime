var Value = require('./Value');

function Class(name, properties) {
  this.name = name;
  this.properties = properties;
}

Class.prototype.newRef = function() {
  return new Value(this);
};

Class.type = 'class';

module.exports = Class;
