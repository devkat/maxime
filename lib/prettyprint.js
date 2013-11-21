var
  parser = require('../dist/parser').parser,
  os = require('os'),
  newline = os.EOL;

function prettyprint(ast, ind) {
  if (typeof ind !== 'string') { ind = ''; };
  return ast.print(ind);
}

module.exports = prettyprint;
