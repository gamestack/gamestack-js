/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
module.exports = function (grunt) {
    // Project configuration.

    var fs = require('fs');

  require('load-grunt-tasks')(grunt); // npm install --save-dev load-grunt-tasks

grunt.initConfig({

    jshint: {
        all: ['ecma/**/*.js'],
        options:{
            esversion:6
        }
    },

    concat: {
        options: {
            separator: ';',
        },

        game_lib:{
            src: [ 'ecma/Gamestack/Main.js', 'ecma/Gamestack/Canvas.js','ecma/Gamestack/Geometry.js', 'ecma/Gamestack/class/*.js', 'ecma/Gamestack/class/sub/*.js','ecma/Gamestack/lib/*.js'],
            dest: 'ecma/Gamestack/concat/Gamestack.js'
        },

    },

    babel: {
        options: {
            sourceMap: true,
            presets: ['babel-preset-es2015']
        },
        game_lib: {
          files: [
            {
                expand: true,
                cwd: 'ecma/Gamestack/concat',
                src: ['Gamestack.js'],
                dest: 'client/dist/js'
            }
        ]

        }
    },

    uglify: {
        options: {
            mangle: false
        },
        my_target: {
            files: {
                'client/dist/js/Gamestack.min.js': ['client/dist/js/Gamestack.js']
            }
        }
    }
});


    grunt.registerTask('build', ['concat',  'babel',  'uglify']);

    grunt.registerTask('default', ['concat', 'babel',  'uglify']);

};
