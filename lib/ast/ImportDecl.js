var
  _ = require('lodash'),
  modules = require('../modules'),
  Import = require('../reflect/import');

function ImportDecl(moduleList) {
  this.moduleNames = moduleList.map(function(ids) {
    return _.pluck(ids, 'name').join('.');
  });
};

ImportDecl.prototype.toString = function() {
  return 'ImportDecl';
};

ImportDecl.prototype.println = function() {
  return 'import ' + this.modules.map(function(m) { return m.print(); }).join(' ');
};

ImportDecl.prototype.populate = function(scope) {
  return new Import(scope, this.moduleNames, this.loc);
};

ImportDecl.prototype.transcode = function() {
  return;
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

module.exports = ImportDecl;
