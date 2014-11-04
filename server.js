var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var https = require('https');
var fs = require('fs');
var domain = require('domain');
var logger = require('./log');
logger.debugLevel = 'warn';

// This line is from the Node.js HTTPS documentation.
var options = {
  key: fs.readFileSync('./resources/localhost5000.key'),
  cert: fs.readFileSync('./resources/localhost5000.cert')
};
var a;
// Create an HTTPS service identical to the HTTP service.
if (cluster.isMaster) {
  // Fork workers.
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', function(worker, code, signal) {
    logger.log('worker ' + worker.process.pid + ' died');
  });
} else {
	
	var server = https.createServer(options).listen(5000);
	logger.log("info","Https server is running on the port: 5000");
	server.on('request', function(req, res) {
		
		var d = domain.create();
		
		d.add(req);
		d.add(res);
		
		d.on('error', function(err) {
			res.writeHead(500);
			logger.log('error', err.message);
			res.end(err.message);
		});
		
		d.run(function() {
			switch(req.url) {
				case "/":
					displayForm(res);
					break;
				case "/upload":
					uploadForm(req, res);
					break;
				case "/download?":
					fileDownload(req, res);
					break;
				default:
				break;
			}
		});
		
	});
}

function displayForm(res) {
	res.writeHeader(200, {"Content-Type": "text/html"});
    res.write(
        'Please choose PDF : <form action="/upload" method="post" enctype="multipart/form-data">'+
        '<input type="file" name="upload">'+
        '<input type="submit" value="Upload">'+
        '</form>'
    );
    res.end();
}

function uploadForm(req, res) {
	
	if(req.method === 'POST') {
	
		var writeData = fs.createWriteStream("Arun.pdf");
		req.pipe(writeData);
		req.on('end', function(){
		res.writeHead(200,{"Content-Type": "text/html"});
		res.write(
			'<form action="/download" method="get" enctype="multipart/form-data">'+
			'<input type="submit" value="Download">'+
			'</form>'
		);
		res.end();
		});	
	}
}

var path = require('path');
var mime = require('mime');

function fileDownload(req, res) {
	logger.log("info", "Download File");
	
	var file = "Arun.pdf";
	var filename = path.basename(file);
	var mimetype = mime.lookup(file);
	
	res.writeHead(200,{"Content-Type": mimetype});
	fs.readFile("Arun.pdf", function (err, content) {
		res.write(content);
		res.end();
	});
}