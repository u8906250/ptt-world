var express = require('express.io');
var Convert = require('ansi-to-html');
var convert = new Convert();
var ptt = require('./lib/ptt.js');
var user = require('./user.js');

var app = express().http().io();

app.use(express.cookieParser())
app.use(express.session({secret: 'test123'}))

var clients = [];
var get_free_client = function() {
	for (i=1; i<128; i++) {
		if (clients[i] === undefined) {
			clients[i] = {"user":'',"status":0,"page":''};
			return i;
		}
	}
	return -1;
}

clients[0] = {"user":'',"status":0};
myclient = clients[0];
myclient.user = user.name;
myclient.datacb = function(data) {
	console.log(data.toString());
};
myclient.endcb = function() {
	delete clients[0];
};
ptt.login (myclient, user.pass);
var myclient_handle = function() {
	if (myclient.status == 6) {
		if (myclient.page != 'live') {
			ptt.write(myclient, 'f\r2\r\r\n');
			ptt.write(myclient, '/Live\r\r');
			myclient.page = 'live';
		} 
	}
}
setInterval(function () {myclient_handle()}, 1000);


app.io.route('ready', function(req) {
	req.io.emit('session', req.session);
});

/*
app.io.route('client_status', function(req) {
	if (req.session.client_idx !== undefined) {
		client = clients[req.session.client_idx];
		if (client !== undefined) {
			req.io.emit('talk', {client_status: client.status});
		} else {
			req.io.emit('talk', {client_status: 0});
		}
	} else {
		req.io.emit('talk', {client_status: 0});
	}
});

app.io.route('friends', function(req) {
	if (req.session.client_idx !== undefined) {
		client = clients[req.session.client_idx];
		if (client !== undefined && client.status == 6) {
			ptt.friends(client);
		}
	}
});

app.io.route('write', function(req) {
	if (req.session.client_idx !== undefined) {
		client = clients[req.session.client_idx];
		if (client !== undefined && client.status == 6) {
			ptt.write(client, req.data.char);
		}
	}
});

app.io.route('login', function(req) {
	if (req.session.client_idx === undefined) {
		client_idx = get_free_client();
		if (client_idx == -1) {
			req.io.emit('talk', {
				message: 'out of ptt client'
			});
			return;
		} else {
			client = clients[client_idx];
		}
	} else {
		client = clients[req.session.client_idx];
	}
	if (client !== undefined && client.status == 0) {
		client.user = req.data.user;
		client.datacb = function(data) {
			//console.log(convert.toHtml(data.toString()));
			console.log(data.toString());
			req.io.emit('talk', {content: convert.toHtml(data.toString())});
		};
		client.endcb = function() {
			if (req.session.client_idx !== undefined) {
				delete clients[req.session.client_idx];
				delete req.session.client_idx;
				req.session.save();
			}
		};
		ptt.login (client, req.data.pass);
		req.session.user = req.data.user;
		req.session.client_idx = client_idx;
		req.session.save();
	}
});

app.io.route('logout', function(req) {
	if (req.session.client_idx !== undefined) {
		client = clients[req.session.client_idx];
		if (client !== undefined) {
			if (client.status == 6) {
				ptt.logout (client);
			}
			delete clients[req.session.client_idx];
		}
		delete req.session.client_idx;
		req.session.save();
	}
});
*/

app.get('/', function(req, res) {
	if (req.session.loginDate === undefined) {
		req.session.loginDate = new Date().toString();
	}
	res.sendfile(__dirname + '/views/client.html')
})

app.listen(7076)
