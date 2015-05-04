var app = require('express.io')()
var net = require('net');
var telnet = require('./lib/telnet.js');

	var client = new net.Socket();
	client.connect('23', 'ptt.cc', function() {
		console.log('CONNECTED TO: ptt.cc:23');
		var mycmd = [[251,24,0,'VT100'],[251,31,80,24],[253,1],[253,3],[254,0],[252,0]];
		var data = telnet.cmd2data(mycmd);
		client.write(data);
		//console.log('mycmd:  ' + mycmd.toString());
		//var ret = telnet.parsing(data);
		//console.log('mycmd2: ' + ret.cmd.toString());
	});
var logined = false;
var accountset = false;
	client.on('data', function(data){
		var ret = telnet.parsing(data);
		//console.log('DATA: ' + data);
		//console.log('cmd: ' + ret.cmd.toString());
		if (ret.data.length > 0) {
			console.log(ret.data.toString());
			if (!logined) {
				if (ret.data[ret.data.length-1] == 0x08) {
					client.write('j');
					client.write('y');
					client.write('b');
					client.write('e');
					client.write('s');
					client.write('t');
					client.write('\r');
					accountset = true;
				}
				if (accountset && ret.data[ret.data.length-1] == 0x20) {
					client.write('3');
					client.write('0');
					client.write('3');
					client.write('2');
					client.write('3');
					client.write('1');
					client.write('\r');
				}
			}
		}
	});
	client.on('close', function(){
		console.log('closed\n');
	});

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
