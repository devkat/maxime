var
  _ = require('lodash'),
  fs = require('fs'),
  path = require('path'),
  filesystem = require('./filesystem'),
  analyze = require('./analyzer'),
  generate = require('./generator'),
  prettyprint = require('./prettyprint'),
  sprintf = require('sprintf'),
  os = require('os'),
  wrench = require('wrench'),
  scope = require('./scope');
  
var magenta = "\x1B[35m";
var yellow = "\x1B[33m";
var green = "\x1B[32m";
var red = "\x1B[31;1m";
var reset = "\x1B[0m";

function compile(sources, target, options) {
  var ast = require('./ast');
  var sourcePaths = _.isArray(sources) ? sources : [ sources ];
  var compilationUnits = sourcePaths.map(path.resolve).map(function(p) {
    return {
      dir: p,
      maxFiles: filesystem.findFiles(p, /\.max$/),
      jsFiles: filesystem.findFiles(p, /\.js$/)
    };
  });
  //console.log("Files:", compilationUnits);
  
  var singleJsProg = '';
  
  compilationUnits.forEach(function(unit) {
    console.log('Compiling sources in ' + unit.dir);
    
    unit.jsFiles.forEach(function(file) {
      console.log('Copying JS file ' + file);
      var jsCode = fs.readFileSync(path.join(unit.dir, file), 'utf8');
      
      if (options.singleFile) {
        singleJsProg += jsCode + '\n';
      }
      else {
        var targetPath = path.join(target, file);
        wrench.mkdirSyncRecursive(path.dirname(targetPath));
        fs.writeFileSync(targetPath, jsCode);
      }
    });

    var parsedSources = unit.maxFiles.map(function(src) {
      var moduleName = src.replace(/\//g, '.').replace(/\.max$/, '');
      console.log('Compiling module ' + moduleName);
      var code = fs.readFileSync(path.join(unit.dir, src), 'utf8');
      var maxAst = ast(code, src);
      maxAst.name = moduleName;
      return {
        src: src,
        ast: maxAst
      };
    });
    
    var scp = new scope.Scope('Maxime.scope', undefined, true);
    
    parsedSources.forEach(function(src) {
      src.populated = src.ast.populate(scp);
    });
    
    parsedSources.forEach(function(src) {
      src.populated.analyze();
    });
    
    parsedSources.forEach(function(parsedSource) {
      if (_.some(unit.jsFiles, function(f) {
        return new RegExp(parsedSource.src.replace(/\.max$/, '.js')).test(f);
      })) return;
      var jsProg = generate(parsedSource.ast);
      if (options.singleFile) {
        singleJsProg += jsProg + '\n';
      }
      else {
        var targetPath = path.join(target, parsedSource.src.replace(/max$/, 'js'));
        wrench.mkdirSyncRecursive(path.dirname(targetPath));
        fs.writeFileSync(targetPath, jsProg);
      }
    });
    /*
    wrench.copyDirSyncRecursive(unit.dir, target, {
      forceDelete: false,
      preserveFiles: false,
      whitelist: true,
      include: /\.js$/
    });
    */
    
  });

  if (options.singleFile) {
    var runtimeLib = fs.readFileSync(path.join('runtime', 'Maxime.js'), 'utf8');
    wrench.mkdirSyncRecursive(path.dirname(target));
    fs.writeFileSync(target,
      (options.before || '') +
      runtimeLib + '\n' +
      singleJsProg +
      (options.after || ''));
  }
  
};

module.exports = compile;