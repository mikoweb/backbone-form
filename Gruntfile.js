module.exports = function (grunt) {
    grunt.initConfig({
        concat: {
            dist: {
                src: [
                    'bower_components/deep-diff/releases/deep-diff-0.3.3.min.js',
                    'src/methods.js',
                    'src/mixins/related.js',
                    'src/mixins/related-silent.js',
                    'src/form-helper.js',
                    'src/form-to-model.js',
                    'src/model-to-form.js',
                    'src/two-way-binding.js',
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
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('dist', [
        'concat:dist',
        'uglify:dist'
    ]);
};
