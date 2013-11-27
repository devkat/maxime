var
  _ = require('lodash'),
  transcode = require('../transcode'),
  ClassDecl = require('./ClassDecl');

function Module(statements) {
  this.statements = statements;
};

Module.prototype.toString = function() {
  return 'Module';
};

Module.prototype.analyze = function(scope) {
  this.statements.forEach(function(stmt) {
    stmt.analyze(scope);
  });
};

Module.prototype.print = function(ind) {
  var newline = require('os').EOL;
  return this.statements.map(function(s) {
    return ind + s.print(ind);
  }).join(newline);
};

Module.prototype.transcode = function() {
  return {
    type: 'Program',
    body: _.flatten(this.statements.filter(function(s) {
      return typeof s.transcode === 'function';
    }).map(function(stmt) {
      return transcode.asStatement(stmt.transcode());
    }))
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

Module.prototype.checkTypes = function() {
  this.statements.forEach(function(s) {
    if (typeof s.checkTypes === 'function') {
      s.checkTypes();
    }
  });
};

module.exports = Module;