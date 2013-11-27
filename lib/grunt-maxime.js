var Compile = function() {
  var
    sourcePaths = this.data.src,
    targetPath = this.data.target,
    options = this.data.options,
    compiler = this.data.compiler;
  
  var compile = require(compiler);
  compile(sourcePaths, targetPath, options);
  
};

module.exports = Compile;