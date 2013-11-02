var
  vows = require('vows'),
  assert = require('assert'),
  compile = require('../lib/compile'),
  fs = require('fs'),
  path = require('path');

function compilerOutput(s) {
  return eval(compile(s));
}

function fixtureCompilerOutput(file) {
  return compilerOutput(fs.readFileSync(path.join('test', 'fixtures', file + '.max'), 'utf8'));
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
      topic: 'hello-world',
      'Hello World': verifyResult
    }
  })
  .export(module);
