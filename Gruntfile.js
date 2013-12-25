module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    /*
    jison: {
      maxime_parser : {
        options: { moduleType: 'commonjs' },
        files: {'dist/parser.js': 'lib/grammar/maxime.jison' }
      }
    },
    */
    vows: {
      src: ["test/*.js"]
    },
    clean: {
      compiler: [ 'bootstrap' ],
      build: [ 'build' ]
    },
    compile: {
      js2js: {
        src: [ 'modules' ],
        target: 'compiler/compiler-js2js.js',
        compiler: './compile',
        options: {
          singleFile: true,
          before: 'var _ = require("lodash");',
          after: '/*console.log(Maxime.scope);*/ module.exports = function(sources, target, options) { Maxime.scope.__maxime__compiler__Compiler._compile(EcmaScript.array2list(sources), EcmaScript.mkString(target), options); };'
        }
      },
      js2max: {
        src: [ 'modules' ],
        target: 'compiler/compiler-js2max.js',
        compiler: '../compiler/compiler-js2js.js',
        options: {
          singleFile: true,
          before: 'var _ = require("lodash");',
          after: 'module.exports = compile;'
        }
      },
      max2max: {
        src: [ 'modules' ],
        target: 'compiler/compiler-max2max.js',
        compiler: '../compiler/compiler-js2max.js',
        options: {
          singleFile: true,
          before: 'var _ = require("lodash");',
          after: 'module.exports = compile;'
        }
      }
    }
  });

  //grunt.loadNpmTasks('grunt-jison');
  grunt.loadNpmTasks('grunt-vows');
  grunt.loadNpmTasks('grunt-contrib-clean');
  
  grunt.registerMultiTask('compile', 'Compile Maxime sources', require('./lib/grunt-maxime'));

  grunt.registerTask('default', [
    //'jison',
    'clean:compiler',
    'compile:js2js',
    'compile:js2max',
    'compile:max2max'
    //'vows'
  ]);

};