var
  _ = require('lodash'),
  modules = require('../modules'),
  Import = require('../reflect/import'),
  transcode = require('../transcode');

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
  return {
    type: 'VariableDeclaration',
    kind: 'var',
    declarations: this.moduleNames.map(function(moduleName) {
      return {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: '__' + moduleName.replace(/\./g, '__')
        },
        init: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Maxime' },
            property: { type: 'Identifier', name: 'scope' }
          },
          property: {
            type: 'Literal',
            value: moduleName
          },
          computed: true
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
