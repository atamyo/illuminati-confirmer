var path = require('path');
var express = require('express');
var fileUpload = require('express-fileupload');

var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(path.resolve(__dirname, 'public'))).use(fileUpload());

app.get('/', function (req, res) {
    
});

app.post('/upload', function(req, res, next) {
	var img = req.files.uploaded;
	if (img.mimetype.substr(0,5) == 'image') {
		var ext = img.mimetype.substr(6);
		var imgPath = path.join(__dirname + '/uploads/illuminaughty.' + ext);
		img.mv(imgPath, function(err) {
			if (err) {
				res.status(500).send(err);
			} else {
				
			}
		});
	}

	res.redirect('/');
});

app.listen(app.get('port'), function () {
    console.log('Finding The Illuminati on port ' + app.get('port'));
});