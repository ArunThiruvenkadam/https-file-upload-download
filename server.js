var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var https = require('https');
var fs = require('fs');
var domain = require('domain');

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
    console.log('worker ' + worker.process.pid + ' died');
  });
} else {
	
	var server = https.createServer(options).listen(5000);
	console.log("Https server is running on the port: 5000");
	server.on('request', function(req, res) {
		
		var d = domain.create();
		
		d.add(req);
		d.add(res);
		
		d.on('error', function(err) {
			res.writeHead(500);
			console.log(err.message);
			res.end(err.message);
		});
		
		d.run(function() {
			console.log(req.url);
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
        '<form action="/upload" method="post" enctype="multipart/form-data">'+
        '<input type="file" name="upload-file">'+
        '<input type="submit" value="Upload">'+
        '</form>'
    );
    res.end();
}

function uploadForm(req, res) {

    if(req.method === 'POST'){
	     
		var writeFile = fs.createWriteStream("Arun.pdf");
		req.pipe(writeFile);
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

function fileDownload(req, res) {
	console.log("Download File");
	res.writeHead(200,{"Content-Type": "application/pdf"});
	fs.readFile("Arun.pdf", function (err, content) {
		res.write(content);
		res.end();
	});
}