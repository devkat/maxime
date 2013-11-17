var
  escodegen = require('escodegen'),
  _ = require('lodash'),
  parser = require('../dist/parser').parser,
  analyze = require('./analyze'),
  esprima = require('esprima');

function transcodeArray(a) {
  return a.map(function(node) {
    return node.transcode();
  });
}

analyze.ast.CtorCall.prototype.transcode = function() {
  return {
    type: 'CallExpression',
    callee: identifier(this.func.name),
    arguments: transcodeArray(this.args)
  };
};

analyze.ast.CtorCall.prototype.transcodeAsStatement = function() {
  return {
    type: 'ExpressionStatement',
    expression: this.transcode()
  };
};

analyze.ast.DefDecl.prototype.transcode = function() {
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

analyze.ast.FunctionCall.prototype.transcode = function() {
  return {
    type: 'CallExpression',
    callee: this.identifier.transcode(),
    arguments: transcodeArray(this.args)
  };
};

analyze.ast.FunctionCall.prototype.transcodeAsStatement = function() {
  return {
    type: 'ExpressionStatement',
    expression: this.transcode()
  };
};

analyze.ast.Identifier.prototype.transcode = function() {
   return {
    type: 'Identifier',
    name: this.name
  };
};

analyze.ast.Literal.prototype.transcode = function() {
  return {
    type: 'Literal',
    value: this.value
  };
};

analyze.ast.NativeExpr.prototype.transcode = function() {
  return esprima.parse(this.expr);
};

analyze.ast.Param.prototype.transcode = function() {
  return this.identifier.transcode();
};

analyze.ast.Program.prototype.transcode = function() {
  return {
    type: 'Program',
    body: this.statements
      .filter(function(s) {
        return typeof s.transcodeAsStatement === 'function'
          || typeof s.transcode === 'function';
      })
      .map(function(s) {
        return typeof s.transcodeAsStatement === 'function'
          ? s.transcodeAsStatement()
          : s.transcode();
      })
  };
};

analyze.ast.ValDecl.prototype.transcode = function() {
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

function generate(maxAst) {
  var jsAst = maxAst.transcode();
  console.log("JS AST: " + JSON.stringify(jsAst, null, ' '));
  return escodegen.generate(jsAst);
}

module.exports = generate;