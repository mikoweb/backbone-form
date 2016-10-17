module.exports = function (grunt) {
    "use strict";

    grunt.initConfig({
        concat: {
            dist: {
                src: [
                    'bower_components/backbone-validation/dist/backbone-validation.js',
                    'src/namespace.js',
                    'src/module.js',
                    'bower_components/deep-diff/releases/deep-diff-0.3.3.min.js',
                    'src/enable-define.js',
                    'src/methods.js',
                    'src/mixins/related.js',
                    'src/mixins/related-silent.js',
                    'src/form-helper.js',
                    'src/model/form-model.js',
                    'src/form-to-model.js',
                    'src/model-to-form.js',
                    'src/two-way-binding.js',
                    'src/collection/item-view.js',
                    'src/collection/collection-view.js',
                    'src/validation/validation-view.js',
                    'src/defaults.js'
                ],
                dest: 'dist/backbone-form.js'
            }
        },
        uglify: {
            dist: {
                preserveComments: false,
                files: {
                    'dist/backbone-form.min.js': ['dist/backbone-form.js']
                }
            }
        },
        copy: {
            dist: {
                files: [
                    {
                        src: 'dist/backbone-form.min.js',
                        dest: 'demo/backbone-form.min.js'
                    }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('dist', [
        'concat:dist',
        'uglify:dist',
        'copy:dist'
    ]);
};
