module.exports = function(grunt) {
    grunt.initConfig({
        cacheBust: {
            options: {
                encoding: 'utf8',
                algorithm: 'md5',
                rename: false
            },
            assets: {
                files: [{
                    src: ['templates/*.twig'],
                    baseDir: '.'
                },{
                    src: ['css/*.css']
                }]
            }
        }
    });
    grunt.loadNpmTasks('grunt-cache-bust');
    grunt.registerTask('bust', ['cacheBust']);
};