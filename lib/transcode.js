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
  var parts = name.split(/\./);
  return parts.length === 1
    ? {
        type: 'Identifier',
        name: parts[0]
      }
    : {
        type: 'MemberExpression',
        object: this.get(parts.slice(0, parts.length - 1).join('.')),
        property: {
          type: 'Identifier',
          name: parts[parts.length - 1]
        }
      };
};

module.exports = transcode;
