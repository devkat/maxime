var
  _ = require('lodash'),
  transcode = require('../transcode'),
  ClassDecl = require('./ClassDecl'),
  Module = require('../reflect/Module'),
  ImportDecl = require('./ImportDecl');

var
  stdModules = [ 'Bool', 'List', 'Map', 'Num', 'Option', 'String', 'Void' ].map(function(name) {
    return 'maxime.' + name;
  });

function ModuleDecl(statements) {
  this.statements = statements;
};

ModuleDecl.prototype.toString = function() {
  return 'ModuleDecl';
};

ModuleDecl.prototype.populate = function(scope) {
  var
    moduleName = '__' + this.name.replace(/\./g, '__'),
    moduleScope = scope.createChildScope(moduleName, true);
  var module = new Module(
    moduleScope,
    this.name,
    this.statements.map(function(stmt) {
      return stmt.populate(moduleScope);
    })
  );
  scope.add(this.loc, this.name, module);
  this.scope = moduleScope;
  return module;
};

ModuleDecl.prototype.print = function(ind) {
  var newline = require('os').EOL;
  return this.statements.map(function(s) {
    return ind + s.print(ind);
  }).join(newline);
};

ModuleDecl.prototype.transcode = function() {
  
  /*
  return {
    type: 'Program',
    body: _.flatten(this.statements.filter(function(s) {
      return typeof s.transcode === 'function';
    }).map(function(stmt) {
      return transcode.asStatement(stmt.transcode());
    }))
  };
  */
  //var namespace = moduleName.slice(0, moduleName.length - 1);
  var moduleIdentifier = { type: 'Identifier', name: '__' + this.name.replace(/\./g, '__') };
  
  var imports = _.uniq(
    _.flatten(
      this.statements.filter(function(stmt) {
        return stmt.constructor === ImportDecl;
      }).map(function(stmt) {
        return stmt.moduleNames;
      })
    )
    .concat(stdModules)
  );
  
  var importAst = {
    type: 'VariableDeclaration',
    kind: 'var',
    declarations: imports.map(function(moduleName) {
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
  
  
  return {
    type: 'Program',
    body: [{
      type: 'ExpressionStatement',
      expression: {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Maxime' },
            property: { type: 'Identifier', name: 'scope' }
          },
          property: moduleIdentifier,
        },
        right: {
          type: 'CallExpression',
          callee: {
            type: 'FunctionExpression',
            params: [],
            body: {
              type: 'BlockStatement',
              body: []
              .concat([
                {
                  type: 'VariableDeclaration',
                  kind: 'var',
                  declarations: [{
                    type: 'VariableDeclarator',
                    id: moduleIdentifier,
                    init: {
                      type: 'ObjectExpression',
                      properties: []
                    }
                  }]
                }
              ])
              .concat(_.flatten(_.compact(this.statements.filter(function(s) {
                  return typeof s.transcodeAsMember === 'function';
                }).map(function(stmt) {
                  return {
                    type: 'ExpressionStatement',
                    expression: {
                      type: 'AssignmentExpression',
                      operator: '=',
                      left: {
                        type: 'MemberExpression',
                        object: moduleIdentifier,
                        property: stmt.name.transcode()
                      },
                      right: stmt.transcodeAsMember()
                    }
                  };
                }))
              ))
              .concat([{
                type: 'ReturnStatement',
                argument: moduleIdentifier
              }])
            }
          },
          arguments: []
        }
      }
    }]
  };
  
  /*
  return {
    type: 'Program',
    body: [{
      type: 'ExpressionStatement',
      expression: {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'Maxime'
          },
          property: {
            type: 'Identifier',
            name: 'addModule'
          }
        },
        arguments: [
          { type: 'Literal', value: this.name },
          {
            type: 'FunctionExpression',
            params: [],
            body: {
              type: 'BlockStatement',
              body: _.flatten(
                this.statements.filter(function(s) {
                  return typeof s.transcode === 'function';
                }).map(function(stmt) {
                  return transcode.asStatement(stmt.transcode());
                })
              ).concat([{
                type: 'ReturnStatement',
                argument: {
                  type: 'ObjectExpression',
                  properties: _.flatten(this.statements.filter(function(stmt) {
                    return stmt.constructor === ClassDecl;
                  }).map(function(classDecl) {
                    return classDecl.ctorDecls.map(function(ctor) {
                      return {
                        key: {
                          type: 'Literal',
                          value: ctor.name.name
                        },
                        value: {
                          type: 'Identifier',
                          name: ctor.name.name
                        }
                      };
                    });
                  }))
                }
              }])
            }
          }
        ]
      }
    }]
  };
  */
};

ModuleDecl.prototype.checkTypes = function() {
  this.statements.forEach(function(s) {
    if (typeof s.checkTypes === 'function') {
      s.checkTypes();
    }
  });
};

module.exports = ModuleDecl;