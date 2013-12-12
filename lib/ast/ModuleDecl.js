var
  _ = require('lodash'),
  transcode = require('../transcode'),
  ClassDecl = require('./ClassDecl'),
  Module = require('../reflect/Module');

function ModuleDecl(statements) {
  this.statements = statements;
};

ModuleDecl.prototype.toString = function() {
  return 'ModuleDecl';
};

ModuleDecl.prototype.populate = function(scope) {
  var moduleScope = scope.createChildScope();
  this.statements.forEach(function(stmt) {
    stmt.populate(moduleScope);
  });
  scope.add(this.loc, this.name, new Module(moduleScope));
  this.scope = moduleScope;
};

ModuleDecl.prototype.analyze = function() {
  this.statements.forEach(function(stmt) {
    stmt.analyze(this.scope);
  });
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
  var scope = this.name.split(/\./);
  //var namespace = moduleName.slice(0, moduleName.length - 1);
  return {
    type: 'Program',
    body: [{
      type: 'ExpressionStatement',
      expression: {
        type: 'CallExpression',
        arguments: [],
        callee: {
         type: 'FunctionExpression',
          params: [],
          body: {
            type: 'BlockStatement',
            body: _.flatten(this.statements.filter(function(s) {
                return typeof s.transcode === 'function';
              }).map(function(stmt) {
                return transcode.asStatement(stmt.transcode(scope));
              })
            )
          }
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