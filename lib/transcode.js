module.exports = {
  
  maxid: function() {
    var args = Array.prototype.slice.call(arguments);
    return {
      type: 'Identifier',
      name: '__max__' + args.join('__')
    };
  },
  
  methodName: function(className, methodName) {
    return this.maxid(className, methodName);
  }

};

