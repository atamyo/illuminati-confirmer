var path = require('path');
var express = require('express');
var fileUpload = require('express-fileupload');
var easyimg = require('easyimage');
var cv = require('opencv');

var app = express();

var exts = {
	'image/jpeg': '.jpg',
	'image/png': '.png',
  	'image/gif': '.gif'
}

app.set('port', (process.env.PORT || 5000));

app.use(express.static(path.resolve(__dirname, 'public'))).use(fileUpload());

app.get('/', function (req, res) {
    
});

app.post('/upload', function(req, res, next) {
	var img = req.files.uploaded;
	
	// Verify that uploaded file is an image
	if (img.mimetype in exts) {
		var ext = exts[img.mimetype];
		var imgPath = path.join(__dirname + '/uploads/illuminaughty' + ext);
		
		img.mv(imgPath, function(err) {
			if (err) {
				res.status(500).send(err);
			} else {

				// Get image info (and get ready for CALLBACK HELL)
				easyimg.info(imgPath).then(
					function(file) {
						// Verify that image is suitably large
						if ((file.width < 960) || (file.height < 300)) {
						    console.error("Image must be at least 640 x 300 pixels");
						} else {
							// Resize image
							easyimg.resize({
								width: 960,
								src: imgPath,
								dst: path.join(__dirname + '/uploads/illuminati' + ext)
							}).then(
								function(image) {
									// Read image using OpenCV library
									
									cv.readImage(image.path, function(err, im) {
										if (err) throw err;
										console.log("omg opencv");
										
										var lowThresh = 0;
										var highThresh = 100;
										var nIters = 2;
										var minArea = 2000;

										var BLUE  = [0, 255, 0]; // B, G, R
										var RED   = [0, 0, 255]; // B, G, R
										var GREEN = [0, 255, 0]; // B, G, R
										var WHITE = [255, 255, 255]; // B, G, R

										var width = im.width()
										var  height = im.height()
										  if (width < 1 || height < 1) throw new Error('Image has no size');

										  var out = new cv.Matrix(height, width);
										  im.convertGrayscale();
										  im_canny = im.copy();
										  im_canny.canny(lowThresh, highThresh);
										  im_canny.dilate(nIters);

										  contours = im_canny.findContours();

										  for (i = 0; i < contours.size(); i++) {

										    if (contours.area(i) < minArea) continue;

										    var arcLength = contours.arcLength(i, true);
										    contours.approxPolyDP(i, 0.01 * arcLength, true);

										    switch(contours.cornerCount(i)) {
										      case 3:
										        out.drawContour(contours, i, GREEN);
										        break;
										      case 4:
										        out.drawContour(contours, i, RED);
										        break;
										      default:
										        out.drawContour(contours, i, WHITE);
										    }
										}

										out.save(path.join(__dirname + '/uploads/out' + ext));
										console.log('yeee');

										/*
										// Detect faces
										im.detectObject(cv.FACE_CASCADE, {}, function(err, faces) {
											
											for (var i=0;i<faces.length; i++){
											      var x = faces[i]
											      im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
											}
											im.save(path.join(__dirname + '/uploads/out' + ext));
										});
										*/
									});
								}
							)
						}

					}, function(err) {
						console.error(err);
					});
				
			}
		});
	} else {
		console.log("Image upload failed");
	}

	res.redirect('/');
});

app.listen(app.get('port'), function () {
    console.log('Finding The Illuminati on port ' + app.get('port'));
});