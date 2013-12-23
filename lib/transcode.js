var
  _ = require('lodash'),
  esprima = require('esprima'),
  squery = require('grasp-squery');

var transcode = {};

transcode.maxid = function() {
  var args = Array.prototype.slice.call(arguments);
  return {
    type: 'Identifier',
    name: '__max__' + args.join('__')
  };
};

transcode.methodName = function(className, methodName) {
  return this.maxid(className, methodName);
};

function substitute(ast, args) {
  if (_.isArray(ast)) {
    return ast.map(substitute);
  }
  else if (_.isObject(ast)) {
    if (ast.type === 'Identifier') {
      var match = ast.name.match(/^__(\w+)/);
      if (match && match.length > 0) {
        var name = match[1];
        var val = args[name];
        if (val) {
          return val;
        }
        else {
          throw new Error('No substitution for ' + name + '.');
        }
      }
    }
  }
  return ast;
}

transcode.query = function(selector, ast) {
  return squery.query(selector, ast);
};

transcode.reify = function(str, args) {
  var ast = esprima.parse(str);
  return substitute(ast, args || []);
};

transcode.asStatement = function(ast) {
  return /Literal|Identifier|Expression$/.test(ast.type)
    ? {
      type: 'ExpressionStatement',
      expression: ast
    }
    : ast;
};

transcode.declare = function(name, ast) {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'Maxime' },
        property: { type: 'Identifier', name: 'declare' }
      },
      arguments: [
        { type: 'Literal', value: name },
        ast
      ]
    }
  };
};

transcode.get = function(name) {
  /*
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'Maxime' },
      property: { type: 'Identifier', name: 'get' }
    },
    arguments: [
      { type: 'Literal', value: name }
    ]
  };
  */
  return {
    type: 'MemberExpression',
    object: name.length === 1
      ? {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'Maxime' },
        property: { type: 'Identifier', name: 'scope' }
      }
      : this.get(name.slice(0, name.length - 1)),
    property: {
      type: 'Literal',
      value: name[name.length - 1]
    },
    computed: true
  };
};

transcode.functionName = function(name) {
  return name
    .replace(/\+/g, '_plus_')
    .replace(/\-/g, '_minus_')
    .replace(/\*/g, '_asterisk_')
    .replace(/\//g, '_slash_')
    .replace(/\\/g, '_backslash_')
    .replace(/\%/g, '_percent_')
  ;
};

module.exports = transcode;
