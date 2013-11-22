var
  _ = require('lodash'),
  Function = require('../reflect/Function'),
  sprintf = require('sprintf');

function FunctionDecl(name, params, body) {
  this.name = name;
  this.params = params;
  this.body = body;
};

FunctionDecl.prototype.toString = function() {
  return 'FunctionDecl';
};

FunctionDecl.prototype.analyze = function(scope) {
  var funcScope = scope.createChildScope();
  this.params.forEach(function(p) {
    p.analyze(funcScope);
  });
  var types = _.pluck(this.params, 'type');
  scope.add(this.loc, this.name.name, new Function(types));
  this.body.forEach(function(stmt) {
    stmt.analyze(funcScope);
  });
};

FunctionDecl.prototype.print = function(ind) {
  var newline = require('os').EOL;
  function print(x) { return x.print(); }
  return ind + sprintf('def %s(%s) = %s',
    this.name.print(),
    this.params.map(print).join(', '),
    this.body.map(function(stmt) {
      return ind + stmt.print(ind);
    }).join(newline)
  ) + newline;
};

FunctionDecl.prototype.transcode = function() {
  return {
    type: 'FunctionDeclaration',
    id: this.name.transcode(),
    params: this.params.map(function(p) { return p.transcode(); }),
    body: {
      type: 'BlockStatement',
      body: this.body.map(function(s) {
        return typeof s.transcodeAsStatement === 'function'
          ? s.transcodeAsStatement()
          : s.transcode();
      })
    }
  };
};

FunctionDecl.prototype.checkTypes = function() {
  
};

module.exports = FunctionDecl;