var
  ClassRef = require('./ClassRef'),
  Class = require('../reflect/Class'),
  Value = require('../reflect/Value'),
  RefProperty = require('../reflect/Property');

function Property(name, typeRef) {
  this.name = name;
  this.typeRef = typeRef;
};

Property.prototype.toString = function() {
  return 'Property';
};

Property.prototype.populate = function(scope) {
  var prop = new RefProperty(scope, this.name.name, this.typeRef.populate(scope));
  scope.add(this.loc, this.name.name, prop);
  return prop;
};

Property.prototype.print = function(ind) {
  return this.name.print() + (
    this.typeRef ? ':' + this.typeRef.print() : ''
  );
};

Property.prototype.transcode = function() {
  return {
    type: 'MemberExpression',
    object: { type: 'ThisExpression' },
    property: this.name.transcode()
  };
};

module.exports = Property;