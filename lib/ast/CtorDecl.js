var
  sprintf = require('sprintf'),
  TypeParamRef = require('./TypeParamRef'),
  TypeRef = require('./TypeRef');

function CtorDecl(id, params) {
  this.identifier = id;
  this.params = params;
};

CtorDecl.prototype.toString = function() {
  return 'CtorDecl';
};

CtorDecl.prototype.print = function(ind) {
  var params = this.params.map(function(param) {
    return param.constructor === TypeRef
      ? '(' + param.print() + ')'
      : param.print();
  });
  return sprintf('%s%s',
    this.identifier.print(),
    params.length === 0 ? '' : ' ' + params.join(' ')
  );
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