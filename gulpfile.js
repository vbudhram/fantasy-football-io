var gulp = require('gulp'),
    less = require('gulp-less'),
    usemin = require('gulp-usemin'),
    wrap = require('gulp-wrap');

var paths = {
    js: 'web/js/**/*.*',
    fonts: 'web/fonts/**.*',
    images: 'web/img/**/*.*',
    styles: 'web/less/**/*.less',
    index: 'web/index.html',
    views: 'web/views/**/*.*',
    bower_fonts: 'web/bower_components/**/*.{ttf,woff,eof,svg}',
    bower_components: 'web/bower_components/**/*.*',
    watch_path: 'web/less/dashboard/**/*.less'
};


gulp.task('usemin', function () {
    return gulp.src(paths.index)
        .pipe(usemin({
            less: [less(), 'concat'],
            js: ['concat', wrap('(function(){ \n<%= contents %>\n})();')],
        }))
        .pipe(gulp.dest('dist/'));
});

/**
 * Copy assets
 */
gulp.task('copy-assets', ['copy-images', 'copy-fonts', 'copy-bower_fonts', 'copy-views']);

gulp.task('copy-images', function () {
    return gulp.src(paths.images)
        .pipe(gulp.dest('dist/img'));
});

gulp.task('copy-fonts', function () {
    return gulp.src(paths.fonts)
        .pipe(gulp.dest('dist/fonts'));
});

gulp.task('copy-bower_fonts', function () {
    return gulp.src(paths.bower_fonts)
        .pipe(gulp.dest('dist/lib'));
});

gulp.task('copy-views', function () {
    return gulp.src(paths.views)
        .pipe(gulp.dest('dist/views'));
});

/**
 * Compile less
 */
gulp.task('compile-less', function () {
    return gulp.src(paths.styles)
        .pipe(less())
        .pipe(gulp.dest('dist/css'));
});

/**
 * Watch less
 */
gulp.task('watch-less', function () {
    gulp.watch(paths.watch_path, ['compile-less']);
});

gulp.task('build', ['usemin', 'copy-assets']);
gulp.task('default', ['build']);
