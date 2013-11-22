var
  sprintf = require('sprintf'),
  Wildcard = require('./Wildcard');

function Pattern(id, args) {
  this.identifier = id;
  this.args = args;
}

Pattern.prototype.toString = function() {
  return 'Pattern';
};

Pattern.prototype.print = function(ind) {
  return sprintf('%s%s',
    this.id.print(),
    this.args.length === 0
      ? ''
      : ' ' + this.args.map(function(a) { return a.print(); }).join(' ')
  );
};

module.exports = Pattern;
