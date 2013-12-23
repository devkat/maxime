var
  _ = require('lodash'),
  Class = require('../reflect/Class'),
  Type = require('../reflect/Type'),
  report = require('../report'),
  sprintf = require('sprintf');

function ClassDecl(name, typeParams, features, ctorDecls) {
  this.name = name;
  this.typeParams = typeParams;
  this.features = features;
  this.ctorDecls = ctorDecls;
}

ClassDecl.prototype.populate = function(scope) {
  
  // Add class to current scope
  var className = this.name.name;
  var that = this;
  
  var classScope = scope.createChildScope(this.name.name);
  
  var typeParams = this.typeParams.map(function(p) {
    return p.populate(classScope);
  });
  
  var ctors = this.ctorDecls.map(function(c) {
    return c.populate(classScope, that);
  });
  
  var ctorMethods = _.zip(ctors.map(function(ctor) {
    return _.sortBy(ctor.methods, 'name');
  }));
  
  var methods = ctorMethods.map(function(tuple) {
    var name = _.pluck(_.compact(tuple), 'name').sort()[0];
    tuple.forEach(function(m, i) {
      if (!m || m.name !== name) {
        report.error(that.loc, sprintf('Constructor %s of class %s must define method %s.',
          that.ctorDecls[i].name.name,
          that.name.name,
          name));
      }
    });
    return tuple[0];
  });
  
  var clazz = new Class(classScope, className, typeParams, ctors, methods, this.loc);
  scope.add(this.loc, className, clazz);
  return clazz;
};

ClassDecl.prototype.transcode = function() {
  /*
    var paramIds = this.params.map(function(param, i) {
    if (param.constructor === ClassRef) {
      return param.name.transcode();
    }
    else {
      return {
        type: 'Identifier',
        name: param.name.name + '_' + i
      };
    }
  });
  */
  return {
    type: 'VariableDeclaration',
    declarations: [{
      type: 'VariableDeclarator',
      id: this.name.transcode(),
      init: {
        type: 'ObjectExpression',
        properties: this.ctorDecls.map(function(x) {
          return x.transcode();
        })
      }
    }],
    kind: 'var'
  };
  
  
  this.ctorDecls.map(function(x) {
    return x.transcode();
  });
};

ClassDecl.prototype.transcodeAsMember = function() {
  return {
    key: this.name.transcode(),
    value: {
      type: 'ObjectExpression',
      properties: this.ctorDecls.map(function(x) {
        return x.transcode();
      })
    }
  };
};

module.exports = ClassDecl;