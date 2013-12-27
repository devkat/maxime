var
  escodegen = require('escodegen');

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

