function Identifier(name) {
  this.name = name;
};

Identifier.prototype.toString = function() {
  return 'Identifier';
};

Identifier.prototype.print = function(ind) {
  return this.name;
};

Identifier.prototype.transcode = function() {
   return {
    type: 'Identifier',
    name: this.name
  };
};

module.exports = Identifier;