var gulp = require('gulp');
var source = require('vinyl-source-stream');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var browserify = require('browserify');

gulp.task('default', ['watch']);
gulp.task('build', ['js', 'browserify:mongoose']);

gulp.task('watch', function() {
  gulp.watch('src/*.js', ['js']);
  gulp.watch('test/test.js', ['browserify:test']);
});

gulp.task('js', function() {
  return gulp.src('src/ractive-adaptors-mongoose.js')
    .pipe(gulp.dest('./'))
    .pipe(uglify())
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(gulp.dest('./'));
});

gulp.task('browserify:mongoose', function() {
  return browserify('./node_modules/mongoose/lib/browser.js')
    .bundle()
    .pipe(source('mongoose.js'))
    .pipe(gulp.dest('demo'));
});

gulp.task('browserify:test', function() {
  return browserify('./test/test.js')
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('test'));
});
