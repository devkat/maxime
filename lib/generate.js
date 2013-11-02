var
  escodegen = require('escodegen'),
  _ = require('lodash'),
  parser = require('../dist/parser').parser;

function transcodeArray(a) {
  return a.map(function(node) {
    return node.transcode();
  });
}

parser.ast.Program.prototype.transcode = function() {
  return {
    type: 'Program',
    body: this.statements.map(function(s) {
      return typeof s.transcodeAsStatement === 'function'
        ? s.transcodeAsStatement()
        : s.transcode();
    })
  };
};

parser.ast.CallExpr.prototype.transcode = function() {
  return {
    type: 'CallExpression',
    callee: this.funcIdentifier.transcode(),
    arguments: transcodeArray(this.args)
  };
};

parser.ast.CallExpr.prototype.transcodeAsStatement = function() {
  return {
    type: 'ExpressionStatement',
    expression: this.transcode()
  };
};

parser.ast.Literal.prototype.transcode = function() {
  return {
    type: 'Literal',
    value: this.value
  };
};

parser.ast.Identifier.prototype.transcode = function() {
  return {
    type: 'Identifier',
    name: this.name
  };
};

parser.ast.ValDecl.prototype.transcode = function() {
  return {
    type: 'VariableDeclaration',
    kind: 'var',
    declarations: [{
      type: 'VariableDeclarator',
      id: this.identifier.transcode(),
      init: this.expr.transcode()
    }]
  };
};

parser.ast.DefDecl.prototype.transcode = function() {
  return {
    type: 'FunctionDeclaration',
    id: this.identifier.transcode(),
    params: transcodeArray(this.params),
    body: {
      type: 'BlockStatement',
      body: this.body.map(function(s) {
        return typeof s.transcodeAsStatement === 'function'
          ? s.transcodeAsStatement()
          : s.transcode();
      })
    }
  };
};

parser.ast.Param.prototype.transcode = function() {
  return this.valueIdentifier.transcode();
};

function generate(maxAst) {
  var jsAst = maxAst.transcode();
  console.log("JS AST: " + JSON.stringify(jsAst, null, ' '));
  return escodegen.generate(jsAst);
}

module.exports = generate;