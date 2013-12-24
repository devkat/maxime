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
    name: '_' + this.name
      .replace(/\+/g, '_plus_')
      .replace(/\-/g, '_minus_')
      .replace(/\*/g, '_asterisk_')
      .replace(/\//g, '_slash_')
      .replace(/\\/g, '_backslash_')
      .replace(/\%/g, '_percent_')
      .replace(/\=/g, '_equals_')
  };
};

module.exports = Identifier;