var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var runSequence = require('run-sequence');
var inject = require('gulp-inject');
require('gulp-grunt')(gulp);

gulp.task('sass', function () {
    return gulp.src('scss/style.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(gulp.dest('css/'));
});

gulp.task('inject', function () {
    return gulp.src('templates/html.twig')
        .pipe(inject(gulp.src(['js/controllers/*.js']),{addRootSlash: false}))
        .pipe(gulp.dest('templates/'));
});

gulp.task('watch', function () {
    gulp.watch('scss/**/*.scss', ['sass']);
    gulp.watch('js/**/*.js', ['inject']);
});

gulp.task('build', function(callback){
    runSequence('sass', 'grunt-bust', callback);
});
