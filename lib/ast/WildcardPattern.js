function WildcardPattern() {
  
}


WildcardPattern.prototype.getPattern = function() {
  return {
    type: 'wildcard'
  };
};

module.exports = WildcardPattern;
