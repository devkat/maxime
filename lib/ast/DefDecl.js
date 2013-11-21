var
  _ = require('lodash'),
  reflect = require('../reflect'),
  sprintf = require('sprintf');

function DefDecl(id, params, body, loc) {
  this.loc = loc,
  this.identifier = id;
  this.params = params;
  this.body = body;
};

DefDecl.prototype.toString = function() {
  return 'DefDecl';
};

DefDecl.prototype.analyze = function(scope) {
  var funcScope = scope.createChildScope();
  this.params.forEach(function(p) {
    p.analyze(funcScope);
  });
  var types = _.pluck(this.params, 'type');
  scope.add(this.loc, this.identifier.name, new reflect.Function(types));
  this.body.forEach(function(stmt) {
    stmt.analyze(funcScope);
  });
};

DefDecl.prototype.print = function(ind) {
  var newline = require('os').EOL;
  function print(x) { return x.print(); }
  return ind + sprintf('def %s(%s) = %s',
    this.identifier.print(),
    this.params.map(print).join(', '),
    this.body.map(function(stmt) {
      return ind + stmt.print(ind);
    }).join(newline)
  ) + newline;
};

DefDecl.prototype.transcode = function() {
  return {
    type: 'FunctionDeclaration',
    id: this.identifier.transcode(),
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

module.exports = DefDecl;