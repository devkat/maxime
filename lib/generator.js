var
  escodegen = require('escodegen'),
  _ = require('lodash'),
  parser = require('./parser'),
  yy = parser.yy;
  
function generate(maxAst) {
  var jsAst = maxAst.transcode();
  //console.log("JS AST: " + JSON.stringify(jsAst, null, ' '));
  return escodegen.generate(jsAst);
}

module.exports = generate;