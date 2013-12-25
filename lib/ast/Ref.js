var
  _ = require('lodash'),
  ReflectRef = require('../reflect/Ref'),
  Property = require('../reflect/Property');

function Ref(name) {
  this.name = name;
};

Ref.prototype.toString = function() {
  return 'Ref';
};

Ref.prototype.populate = function(scope) {
  this.ref = new ReflectRef(scope, this.name.name, this.loc);
  return this.ref;
};

Ref.prototype.print = function(ind) {
  return this.name.print();
};

Ref.prototype.transcode = function() {
  if (this.ref.object.constructor === Property) {
    return {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'that' },
      property: this.name.transcode()
    };
  }
  else {
    return this.name.transcode();
  }
};

module.exports = Ref;