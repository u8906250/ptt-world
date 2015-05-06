var app = require('express.io')()
var fs = require('fs');
var ptt = require('./lib/ptt.js');

var user = fs.readFileSync('user','utf8');
var pass = fs.readFileSync('pass','utf8');

if (user !== undefined && pass !== undefined) {
	ptt.login (user,pass);
}

app.http().io()

app.io.route('ready', function(req) {
	req.io.emit('talk', {
		message: 'io event from an io route on the server'
	})
})

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/views/client.html')
})

app.listen(7076)
