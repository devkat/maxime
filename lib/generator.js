var
  escodegen = require('escodegen'),
  _ = require('lodash'),
  parser = require('./parser'),
  esprima = require('esprima'),
  yy = parser.yy;

function transcodeArray(a) {
  return a.map(function(node) {
    return node.transcode();
  });
}

yy.CtorCall.prototype.transcode = function() {
  return {
    type: 'CallExpression',
    callee: this.identifier.transcode(),
    arguments: transcodeArray(this.args)
  };
};

yy.CtorCall.prototype.transcodeAsStatement = function() {
  return {
    type: 'ExpressionStatement',
    expression: this.transcode()
  };
};

yy.DefDecl.prototype.transcode = function() {
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

yy.FunctionCall.prototype.transcode = function() {
  return {
    type: 'CallExpression',
    callee: this.identifier.transcode(),
    arguments: transcodeArray(this.args)
  };
};

yy.FunctionCall.prototype.transcodeAsStatement = function() {
  return {
    type: 'ExpressionStatement',
    expression: this.transcode()
  };
};

yy.Identifier.prototype.transcode = function() {
   return {
    type: 'Identifier',
    name: this.name
  };
};

yy.Literal.prototype.transcode = function() {
  return {
    type: 'Literal',
    value: this.value
  };
};

yy.NativeExpr.prototype.transcode = function() {
  return esprima.parse(this.expr);
};

yy.Param.prototype.transcode = function() {
  return this.valueIdentifier.transcode();
};

yy.Program.prototype.transcode = function() {
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

yy.Reference.prototype.transcode = function() {
  return this.identifier.transcode();
};

yy.ValDecl.prototype.transcode = function() {
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