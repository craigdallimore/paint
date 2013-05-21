module.exports = function(grunt) {

    grunt.initConfig({
        dirs: {
            js: 'js/',
            dist: 'dist/'
        },
        concat: {
            js: {
                src: [
                    '<%= dirs.js %>shim.js',
                    '<%= dirs.js %>App.js',
                    '<%= dirs.js %>Events.js',
                    '<%= dirs.js %>Mediator.js',
                    '<%= dirs.js %>Model.js',
                    '<%= dirs.js %>PaletteModel.js',
                    '<%= dirs.js %>PaletteView.js',
                    '<%= dirs.js %>PixelModel.js',
                    '<%= dirs.js %>PixelView.js',
                    '<%= dirs.js %>View.js',
                    '<%= dirs.js %>Collection.js',
                    '<%= dirs.js %>Templates.js',
                    '<%= dirs.js %>init.js'
                ],
                dest: '<%= dirs.dist %>app.concat.js'
            }
        },
        uglify: {
            files: {
                src: ['<%= concat.js.dest %>'],
                dest: '<%= dirs.dist %>app.min.js'
            }
        },
        watch: {
            scripts: {
                files: '<%= concat.js.src %>',
                tasks: 'js'
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('js', ['concat:js', 'uglify']);

};


