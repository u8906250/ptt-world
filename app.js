var express = require('express.io');
var ptt = require('./lib/ptt.js');

var app = express().http().io();

app.use(express.cookieParser())
app.use(express.session({secret: 'test123'}))

var clients = [];
var get_free_client = function() {
	for (i=0; i<128; i++) {
		if (clients[i] === undefined) {
			clients[i] = {"user":'',"status":0};
			return i;
		}
	}
	return -1;
}

var client = {"user":'',"status":0};

app.io.route('ready', function(req) {
	req.io.emit('talk', {
		message: 'io event from an io route on the server'
	});
});

app.io.route('client_status', function(req) {
	req.io.emit('talk', {client_status: client.status});
});

app.io.route('login', function(req) {
	if (req.session.client_idx === undefined) {
		client_idx = get_free_client();
		if (client_idx == -1) {
		//TODO
		} else {
			client = clients[client_idx];
			req.session.client_idx = client_idx;
			if (client.status == 0) {
				client.user = req.data.user;
				ptt.login (client, req.data.pass);
				req.session.user = req.data.user;
				req.session.save();
			}
		}
	}
});

app.io.route('logout', function(req) {
	if (req.session.client_idx !== undefined) {
		client = clients[req.session.client_idx];
		if (client.status == 6) {
			ptt.logout (client);
		}
		delete clients[req.session.client_idx];
		delete req.session.client_idx;
	}
});


app.get('/', function(req, res) {
	
	if (req.session.loginDate === undefined) {
		req.session.loginDate = new Date().toString();
	}
	res.sendfile(__dirname + '/views/client.html')
})

app.listen(7076)
