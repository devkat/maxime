var
  transcode = require('../transcode');

function CtorPattern(name, paramPatterns) {
  this.name = name;
  this.paramPatterns = paramPatterns;
};

CtorPattern.prototype.populate = function(scope) {
  this.paramPatterns.forEach(function(p) {
    p.populate(scope);
  });
};

CtorPattern.prototype.analyze = function() {
  // FIXME
};

CtorPattern.prototype.getPattern = function() {
  return {
    type: 'constructor',
    name: this.name.name,
    params: this.paramPatterns.map(function(pattern) {
      return pattern.getPattern();
    })
  };
};

module.exports = CtorPattern;
