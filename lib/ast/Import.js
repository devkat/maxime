var
  _ = require('lodash'),
  modules = require('../modules');

function Import(moduleList) {
  this.moduleNames = moduleList.map(function(ids) {
    return _.pluck(ids, 'name').join('.');
  });
};

Import.prototype.toString = function() {
  return 'Import';
};

Import.prototype.println = function() {
  return 'import ' + this.modules.map(function(m) { return m.print(); }).join(' ');
};

Import.prototype.populate = function(scope) {
  this.scope = scope;
};

Import.prototype.analyze = function() {
  var that = this;
  this.moduleNames.forEach(function(name) {
    var module = that.scope.lookup(that.loc, name, 'module');
    that.scope.merge(module.getScope());
  });
  
  
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
