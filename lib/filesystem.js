var
  path = require('path'),
  fs = require('fs'),
  filesystem = {};

filesystem.traverseDir = function(dir, callback) {
  var files = fs.readdirSync(dir);
  for (var i in files) {
     var currentFile = path.join(dir, files[i]);
     var stats = fs.statSync(currentFile);
     if (stats.isFile()) {
       callback(dir, files[i], stats);
     }
    else if (stats.isDirectory()) {
      filesystem.traverseDir(currentFile, callback);
    }
  }
};

filesystem.findFiles = function(baseDir, regex) {
  var files = [];
  filesystem.traverseDir(baseDir, function(dir, name, stat) {
    if (name.match(regex)) {
      files.push(path.join(dir, name).substring(baseDir.length + 1));
    }
  });
  return files;
};

module.exports = filesystem;
