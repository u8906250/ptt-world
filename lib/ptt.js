var net = require('net');
var telnet = require('./telnet.js');

module.exports = {
	login: function (user, pass) {
		var client = new net.Socket();
		var client_status= 0; 
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
			switch (client_status) {
				case 1:
					break;
				default:
					break;
			}
			//console.log('DATA: ' + data);
			console.log('cmd: ' + ret.cmd.toString());
			if (ret.data.length > 0) {
				console.log(ret.data.toString());
				if (ret.data[ret.data.length-1] == 0x08) {
					for (i=0; i<user.length; i++) {
						client.write(user[i]);
					}
					client.write('\r');
				}
				if (ret.data[ret.data.length-1] == 0x20) {
					for (i=0; i<pass.length; i++) {
						client.write(pass[i]);
					}
					client.write('\r');
				}
			}
		});
		client.on('close', function(){
			client_status = 0;
		});
	}
};

