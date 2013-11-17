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
    }
  });

  //grunt.loadNpmTasks('grunt-jison');
  grunt.loadNpmTasks('grunt-vows');

  grunt.registerTask('default', [
    //'jison',
    'vows'
  ]);

};