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
      jsCompiler: {
        src: [ 'modules' ],
        target: 'compiler/compiler-js.js',
        compiler: './compile',
        options: {
          singleFile: true,
          before: 'var _ = require("lodash");',
          after: 'module.exports = compile;'
        }
      },
      maxCompiler: {
        src: [ 'modules' ],
        target: 'compiler/compiler-maxime.js',
        compiler: '../compiler/compiler-js.js',
        options: {
          singleFile: true
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
    'compile:jsCompiler',
    'compile:maxCompiler'
    //'vows'
  ]);

};