var
  _ = require('lodash');

function Program(statements) {
  this.statements = statements;
};

Program.prototype.toString = function() {
  return 'Program';
};

Program.prototype.analyze = function(scope) {
  this.statements.forEach(function(stmt) {
    stmt.analyze(scope);
  });
};

Program.prototype.print = function(ind) {
  var newline = require('os').EOL;
  return this.statements.map(function(s) {
    return ind + s.print(ind);
  }).join(newline);
};

Program.prototype.transcode = function() {
  return {
    type: 'Program',
    body: _.flatten(this.statements
      .filter(function(s) {
        return typeof s.transcodeAsStatement === 'function'
          || typeof s.transcode === 'function';
      })
      .map(function(s) {
        return typeof s.transcodeAsStatement === 'function'
          ? s.transcodeAsStatement()
          : s.transcode();
      })
    )
  };
};

Program.prototype.checkTypes = function() {
  this.statements.forEach(function(s) {
    if (typeof s.checkTypes === 'function') {
      s.checkTypes();
    }
  });
};

module.exports = Program;