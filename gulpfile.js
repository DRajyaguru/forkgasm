var gulp = require("gulp");
var rename = require("gulp-rename");
var postcss = require('gulp-postcss');
var fileinclude = require("gulp-file-include");
var resize = require("gulp-image-resize");
var fs = require("fs");

gulp.task('css', function () {
	return gulp.src(["**/*.src.css", "!node_modules/**"])
		.pipe(postcss([
			require('postcss-nesting')(),
			require("postcss-selector-matches")({
				lineBreak: true
			}),
			require('autoprefixer')({
				browsers: ["last 2 versions"]
			}),
			require("postcss-custom-properties")({
				preserve: false,
				warnings: false
			})
		]))
		.pipe(rename({ extname: "" }))
		.pipe(rename({ extname: ".css" }))
		.pipe(gulp.dest('.'));
});

gulp.task("html", function() {
	return gulp.src(["**/*.tpl.html"])
		.pipe(fileinclude({
			basepath: "templates/"
		}).on("error", function(error) {
			console.error(error);
		}))
		.pipe(rename({ extname: "" }))
		.pipe(rename({ extname: ".html" }))
		.pipe(gulp.dest("."))
});

function makeThumbnails(src) {
	console.log("Making thumbnails for ", src, "...");
	return gulp.src(src)
		.pipe(resize({
			width: 140,
			height: 140,
			crop: true,
			upscale: false,
			cover: true,
			noProfile: true,
			sharpen: true,
			filter: "Catrom"
		}))
		.pipe(gulp.dest("images/dishes/thumbs"))
}

gulp.task("thumbnails", function() {
	return makeThumbnails("images/dishes/*.jpg");
});

gulp.task("watch", function() {
	gulp.watch(["**/*.src.css"], ["css"]);
	gulp.watch(["**/*.tpl.html", "./templates/*.html"], ["html"]);
	gulp.watch("images/dishes/*.jpg", obj => {
		if (obj.type == "deleted") {
			// Delete file
			var thumb = obj.path.replace("/dishes/", "/dishes/thumbs/");
			console.log("Deleting", thumb, "...");
			fs.unlink(thumb, err => {
				if (err && !(err.errno == -2 && err.code == "ENOENT")) {
					console.log("Error:", err);
				}
			});
		}
		else {
			// Regenerate thumbnail
			makeThumbnails(obj.path.replace(process.cwd() + "/", ""));
		}
	})
});

gulp.task("default", ["css"]);
