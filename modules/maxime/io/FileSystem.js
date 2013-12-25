Maxime.scope.__maxime__io__FileSystem = function () {
  var __maxime__io__FileSystem = {};
  __maxime__io__FileSystem._FileSystem = {
    _FileSystem: function () {
      var _FileSystem = function () {
        this._constructor = 'Path';
        this._properties = [];
      };
      _FileSystem.prototype._findFiles = function (_path, _regexp) {
        var that = this;
        var
          fs = require('fs'),
          filesystem = require('../lib/filesystem'),
          EcmaScript = require('./EcmaScript');
        
        var path = EcmaScript.list2array(_path).join('/');
        var files = filesystem.findFiles(path, _regexp._s).map(function(f) {
          return EcmaScript.mkString(f);
        });
        return EcmaScript.array2list(files);
      };
      return _FileSystem;
    }()
  };
  return __maxime__io__FileSystem;
}();
