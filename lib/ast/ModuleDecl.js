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
  var moduleScope = scope.createChildScope(this.name);
  var module = new Module(
    moduleScope,
    this.name,
    this.statements.map(function(stmt) {
      var ret = stmt.populate(moduleScope);
      if (!ret) {
        console.log("111", stmt.constructor);
      }
      return ret;
      //return stmt.populate(moduleScope);
    })
  );
  scope.add(this.loc, this.name, module);
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
          property: {
            type: 'Literal',
            value: this.name
          },
          computed: true
        },
        right: {
          type: 'ObjectExpression',
          properties: _.flatten(_.compact(this.statements.filter(function(s) {
              return typeof s.transcodeAsMember === 'function';
            }).map(function(stmt) {
              return stmt.transcodeAsMember();
            }))
          )
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