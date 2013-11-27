var
  escodegen = require('escodegen'),
  _ = require('lodash'),
  parser = require('./parser'),
  yy = parser.yy;
  
function generate(maxAst) {
  //console.log("Max AST: ", maxAst);
  var jsAst = maxAst.transcode();
  //console.log("JS AST: " + JSON.stringify(jsAst, null, ' '));
  return escodegen.generate(jsAst, {
    format: {
      indent: {
        style: '  '
      }
    }
  });
}

module.exports = generate;