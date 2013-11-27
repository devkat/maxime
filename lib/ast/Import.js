var
  _ = require('lodash'),
  modules = require('../modules');

function Import(modules) {
  this.modules = modules;
};

Import.prototype.toString = function() {
  return 'Import';
};

Import.prototype.println = function() {
  return 'import ' + this.modules.map(function(m) { return m.print(); }).join(' ');
};

Import.prototype.analyze = function(scope) {
  /*
  this.moduleAsts = this.modules.map(function(literal) {
    var module = modules.importModule(scope, literal.value);
    return module.ast;
  });
  */
};

Import.prototype.transcode = function() {
  return [];
  return {
    type: 'VariableDeclaration',
    declarations: this.modules.map(function(module) {
      return {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: _.pluck(module, 'name').join('__')
        },
        init: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'Identifier',
              name: 'Maxime'
            },
            property: {
              type: 'Identifier',
              name: 'getModule'
            }
          },
          arguments: [{
            type: 'Literal',
            value: _.pluck(module, 'name').join('.')
          }]
        }
      };
    })
  };
  
  
  /*
  return this.moduleAsts.map(function(ast) {
    return ast.transcode().body;
  });
  */
};

module.exports = Import;
