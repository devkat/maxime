Maxime.scope.__maxime__io__FileSystem = function () {
  var __maxime__io__FileSystem = {};
  __maxime__io__FileSystem._FileSystem = {
    _FileSystem: function () {
      var _FileSystem = function () {
        this._constructor = 'Path';
        this._properties = [];
      };
      
      function path2string(path) {
        return EcmaScript.max2js(path._segments).join('/');
      }
      
      _FileSystem.prototype._findFiles = function (_file, _regexp) {
        var that = this;
        var
          fs = require('fs'),
          filesystem = require('../lib/filesystem');
        var path = path2string(_file._path);
        var files = filesystem.findFiles(path, new RegExp(_regexp._pattern._s)).map(function(f) {
          var segments = EcmaScript.js2max(f.split(/\//));
          var path = new Maxime.scope.__maxime__io__Path._Path._Path(segments, EcmaScript.js2max(true));
          return new Maxime.scope.__maxime__io__File._File._File(path);
        });
        return EcmaScript.js2max(files);
      };
      
      _FileSystem.prototype._read = function(_file) {
        var that = this;
        var path = path2string(_file._path);
        return EcmaScript.js2max(fs.readFileSync(path, 'utf8'));
      };
      
      return _FileSystem;
    }()
  };
  return __maxime__io__FileSystem;
}();
