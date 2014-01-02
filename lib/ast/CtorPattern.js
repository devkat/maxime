var
  transcode = require('../transcode'),
  Constructor = require('../reflect/Constructor');

function CtorPattern(name, paramPatterns) {
  this.name = name;
  this.paramPatterns = paramPatterns;
};

CtorPattern.prototype.populate = function(scope) {
  return new ReflectCtorPattern(
    scope,
    this.name.name,
    this.paramPatterns.map(function(p) {
      return p.populate(scope);
    }),
    this.loc
  );
};

function ReflectCtorPattern(scope, name, paramPatterns, loc) {
  this.scope = scope;
  this.name = name;
  this.paramPatterns = paramPatterns;
  this.loc = loc;
}

ReflectCtorPattern.prototype.analyze = function() {
  var ctor = this.scope.lookup(this.loc, this.name, Constructor);
  this.paramPatterns.forEach(function(pattern, i) {
    pattern.analyze(ctor.properties[i]);
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
