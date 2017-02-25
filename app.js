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
										console.log("omg opencv");
										im.detectObject(cv.FACE_CASCADE, {}, function(err, faces) {
											
											for (var i=0;i<faces.length; i++){
											      var x = faces[i]
											      im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
											}
											im.save(path.join(__dirname + '/uploads/out' + ext));
										});
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