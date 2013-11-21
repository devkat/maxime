function Identifier(name, loc) {
  this.loc = loc,
  this.name = name;
};

Identifier.prototype.toString = function() {
  return 'Identifier';
};

Identifier.prototype.analyze = function(scope) {
  scope.lookup(this.loc, this.name);
  return new yy.Identifier(this.name);
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