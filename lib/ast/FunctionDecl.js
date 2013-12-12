var
  _ = require('lodash'),
  Function = require('../reflect/Function'),
  FunctionType = require('../reflect/FunctionType'),
  sprintf = require('sprintf');

function FunctionDecl(name, params, returnTypeDecl, body) {
  this.name = name;
  this.params = params;
  this.returnTypeDecl = returnTypeDecl;
  this.body = body;
};

FunctionDecl.prototype.toString = function() {
  return 'FunctionDecl';
};

FunctionDecl.prototype.analyze = function(scope) {
  
  // Create scope for function body
  var funcScope = scope.createChildScope();
  
  // Analyze parameters and resolve types
  var paramTypes = this.params.map(function(p) {
    p.analyze(funcScope);
    return p.type;
  });
  
  // Analyze body
  this.body.analyze(funcScope);

  var returnType = this.body.getType();
  var funcType = new FunctionType(paramTypes, returnType);
  scope.add(this.loc, this.name.name, new Function(funcType));

};

FunctionDecl.prototype.print = function(ind) {
  var newline = require('os').EOL;
  function print(x) { return x.print(); }
  return ind + sprintf('def %s(%s) = %s',
    this.name.print(),
    this.params.map(print).join(', '),
    this.body.print()
  ) + newline;
};

FunctionDecl.prototype.transcode = function() {
  return {
    type: 'FunctionDeclaration',
    id: this.name.transcode(),
    params: this.params.map(function(p) { return p.transcode(); }),
    body: {
      type: 'BlockStatement',
      body: this.body ? [{
        type: 'ReturnStatement',
        argument: this.body.transcode()
      }] : []
    }
  };
};

FunctionDecl.prototype.checkTypes = function() {
  
};

module.exports = FunctionDecl;