var express = require('express');
var https = require('https');
var fs = require('fs');

// This line is from the Node.js HTTPS documentation.
var options = {
  key: fs.readFileSync('./resources/localhost5000.key'),
  cert: fs.readFileSync('./resources/localhost5000.cert')
};

// Create a service (the app object is just a callback).
var app = express();

// Create an HTTPS service identical to the HTTP service.
var server = https.createServer(options, app).listen(5000);
console.log("Https server is listening");

app.get("/", function(req,res){
	res.writeHead(200);
	res.end("hello world\n");
});

app.get("/hai", function(req,res){
	res.writeHead(200);
	res.end("hai\n");
});