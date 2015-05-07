var net = require('net');
var sleep = require('sleep');
var telnet = require('./telnet.js');

module.exports = {
	login: function (user, pass) {
		var client = new net.Socket();
		var client_status= 0; 
		var user_idx=0;
		/*
		 * 0: disconnect
		 * 1: connected
		 * 2: accounting
		 * 3: passwording
		 */
		client.connect('23', 'ptt.cc', function() {
			console.log('CONNECTED TO: ptt.cc:23');
			var mycmd = [[251,24,0,'VT100'],[251,31,80,24],[253,1],[253,3],[254,0],[252,0]];
			var data = telnet.cmd2data(mycmd);
			client.write(data);
			client_status = 1;
			//console.log('mycmd:  ' + mycmd.toString());
			//var ret = telnet.parsing(data);
			//console.log('mycmd2: ' + ret.cmd.toString());
		});
		client.on('data', function(data){
			var ret = telnet.parsing(data);
			//console.log('cmd: ' + ret.cmd.toString());
			//console.log('DATA: ' + ret.data.toString());
			switch (client_status) {
				case 1:
					if (ret.data.length > 0) {
						if (ret.data[ret.data.length-1] == 0x08) {
							client.write(user[user_idx++]);
							client_status = 2;
						}
					}
					break;
				case 2:
					if (ret.data.length > 0) {
						if (user_idx < user.length) {
							client.write(user[user_idx++]);
						} else {
							client.write('\r');
							client_status = 3;
						}
					}
					break;
				case 3:
					client_status = 4;
					for(i=0; i<pass.length; i++) {
						client.write(pass[i]);
						sleep.usleep(500000);
					}
					client.write('\r');
					break;
				default:
					break;
			}
		});
		client.on('close', function(){
			client_status = 0;
		});
	}
};

