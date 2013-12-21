var
  transcode = require('../transcode');

function CtorPattern(name, paramPatterns) {
  this.name = name;
  this.paramPatterns = paramPatterns;
};

CtorPattern.prototype.populate = function(scope) {
  return new ReflectCtorPattern(
    scope,
    this.paramPatterns.map(function(p) {
      return p.populate(scope);
    })
  );
};

function ReflectCtorPattern(scope, paramPatterns) {
  this.scope = scope;
  this.paramPatterns = paramPatterns;
}

ReflectCtorPattern.prototype.analyze = function() {
  // FIXME
  this.paramPatterns.forEach(function(pattern) {
    pattern.analyze();
  });
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
