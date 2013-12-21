function WildcardPattern() {
  
}

WildcardPattern.prototype.getPattern = function() {
  return {
    type: 'wildcard'
  };
};

WildcardPattern.prototype.populate = function(scope) {
  return new ReflectWildcardPattern();
};

function ReflectWildcardPattern() {
}

ReflectWildcardPattern.prototype.analyze = function() {
};

module.exports = WildcardPattern;
