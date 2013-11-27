var
  transcode = require('../transcode');

function CtorPattern(name, paramPatterns) {
  this.name = name;
  this.paramPatterns = paramPatterns;
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
