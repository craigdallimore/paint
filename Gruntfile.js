module.exports = function(grunt) {

    grunt.initConfig({
        dirs: {
            js: 'js/',
            dist: 'dist/'
        },
        concat: {
            js: {
                src: [
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
        watch: {
            scripts: {
                files: '<%= concat.js.src %>',
                tasks: 'js'
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('js', ['concat:js']);

};


