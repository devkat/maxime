var
  sprintf = require('sprintf'),
  ClassRef = require('./ClassRef'),
  Property = require('../reflect/Property');

function CtorDecl(name, params) {
  this.name = name;
  this.params = params;
};

CtorDecl.prototype.toString = function() {
  return 'CtorDecl';
};

CtorDecl.prototype.print = function(ind) {
  return sprintf('%s (%s)',
    this.name.print(),
    this.params.map(function(p) { return p.print(); }).join(', ')
  );
};

CtorDecl.prototype.analyze = function(scope) {
  // Create properties
  this.properties = this.params.map(function(p) {
    return new Property(p.name.name, p.type);
  });
  
};

CtorDecl.prototype.transcode = function() {
  var paramIds = this.params.map(function(param, i) {
    if (param.constructor === TypeParamRef) {
      return param.identifier.transcode();
    }
    else {
      return {
        type: 'Identifier',
        name: param.identifier.name + '_' + i
      };
    }
  });
  
  return {
    type: 'FunctionDeclaration',
    id: this.identifier.transcode(),
    params: paramIds,
    body: {
      type: 'BlockStatement',
      body: paramIds.map(function(paramId) {
        return {
          type: 'FunctionDeclaration',
          id: paramId,
          params: [],
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ReturnStatement',
                argument: paramId
              }
            ]
          }
        };
      })
    }
  };
};

module.exports = CtorDecl;