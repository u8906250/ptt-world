var net = require('net');
var sleep = require('sleep');
var telnet = require('./telnet.js');

module.exports = {
	login: function (client) {
		var sock = new net.Socket();
		client.status= 0; 
		var user_idx=0;
		/*
		 * 0: disconnect
		 * 1: connected
		 * 2: accounting
		 * 3: accounting done
		 * 4: passwording
		 * 5: passwording done
		 */
		sock.connect('23', 'ptt.cc', function() {
			console.log('CONNECTED TO: ptt.cc:23');
			var mycmd = [[251,24,0,'VT100'],[251,31,80,24],[253,1],[253,3],[254,0],[252,0]];
			var data = telnet.cmd2data(mycmd);
			sock.write(data);
			client.status = 1;
			//console.log('mycmd:  ' + mycmd.toString());
			//var ret = telnet.parsing(data);
			//console.log('mycmd2: ' + ret.cmd.toString());
		});
		sock.on('data', function(data){
			var ret = telnet.parsing(data);
			//console.log('cmd: ' + ret.cmd.toString());
			//console.log('DATA: ' + ret.data.toString());
			switch (client.status) {
				case 1:
					if (ret.data.length > 0) {
						if (ret.data[ret.data.length-1] == 0x08) {
							sock.write(client.user[user_idx++]);
							client.status = 2;
						}
					}
					break;
				case 2:
					if (ret.data.length > 0) {
						if (user_idx < client.user.length) {
							sock.write(client.user[user_idx++]);
						} else {
							sock.write('\r');
							client.status = 3;
						}
					}
					break;
				case 3:
					client.status = 4;
					for(i=0; i<client.pass.length; i++) {
						sock.write(client.pass[i]);
						sleep.usleep(500000);
					}
					sock.write('\r');
					client.status = 5;
					break;
				case 5:
					break;
				default:
					break;
			}
		});
		sock.on('close', function(){
			client.status = 0;
		});
	}
};

