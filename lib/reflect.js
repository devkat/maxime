var reflect = {};

reflect.Value = function(type) {
  this.type = type;
};
reflect.Value.type = 'value';

reflect.Function = function(types) {
  this.types = types;
};
reflect.Function.type = 'function';

reflect.Type = function() {
  
};
reflect.Type.type = 'type';


module.exports = reflect;
