var app = require('express.io')()
var ptt = require('./lib/ptt.js');

var client = {"user":'',"pass":'',"status":0};

app.http().io()

app.io.route('ready', function(req) {
	req.io.emit('talk', {
		message: 'io event from an io route on the server'
	});
});

app.io.route('client_status', function(req) {
	req.io.emit('talk', {client_status: client.status});
});

app.io.route('login', function(req) {
	if (client.status == 0) {
		client.user = req.data.user;
		client.pass = req.data.pass;
		ptt.login (client);
		req.io.emit('talk', {client_status: client.status});
	}
});


app.get('/', function(req, res) {
    res.sendfile(__dirname + '/views/client.html')
})

app.listen(7076)
