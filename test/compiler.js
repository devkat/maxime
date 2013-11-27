var
  _ = require('lodash'),
  sprintf = require('sprintf'),
  vows = require('vows'),
  assert = require('assert'),
  compile = require('../lib/compile'),
  fs = require('fs'),
  path = require('path'),
  srcDir = path.join('test', 'maxime'),
  targetDir = path.join('build', 'test'),
  filesystem = require('../lib/filesystem'),
  wrench = require('wrench');

var compiled = false;

function loadStdLib() {
  var basePath = path.join(targetDir, 'maxime');
  return _.flatten([
    path.join('build', 'runtime', 'Maxime.js'),
    filesystem.findFiles(basePath, /\.js$/).map(function(f) {
      return path.join(basePath, f);
    })
  ]).map(function(file) {
    return fs.readFileSync(file);
  }).join('\n');
}

function loadModule(name) {
  return loadStdLib() + '\n' + fs.readFileSync(path.join(targetDir, 'fixtures', name + '.js'), 'utf8');
}

function compilerOutput(file) {
  if (!compiled) {
    wrench.copyDirSyncRecursive('runtime', path.join('build', 'runtime'), {
      forceDelete: true,
      preserveFiles: false
    });
    compile([ 'modules', srcDir ], targetDir);
    compiled = true;
  }
  //var code = loadModule(file) + sprintf('\nMaxime.getModule("fixtures.%s")();', file);
  var code = loadModule(file);
  //console.log(code);
  return eval(code);
}

function fixtureCompilerOutput(file) {
  return compilerOutput(file);
}

function fixtureExpectedOutput(file) {
  return fs.readFileSync(path.join('test', 'fixtures', file + '.out'), 'utf8');
}

function expectExecutionToHaveExpectedOutput(s) {
  var expected = fixtureExpectedOutput(s);
  var compiled = fixtureCompilerOutput(s);

  var child = child_process.spawn(processBin);
  child.stdin.write(compiled, 'utf8');
  child.stdin.end();
  child.stdout.setEncoding('utf8');

  var actual = '';
  asyncSpecWait();
  child.stdout.on('data', function(d) {
      actual += d;
  });
  child.stdout.on('end', function() {
      expect(actual).toEqual(expected);
      asyncSpecDone();
  });
}

function verifyResult(file) {
  fixtureCompilerOutput(file);
}

vows
  .describe('Compiler')
  .addBatch({
    'Compile': {
      topic: 'HelloWorld',
      'Hello World': verifyResult
    }
  })
  .export(module);
