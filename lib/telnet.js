module.exports = {
	parsing: function (data) {
		var buf = new Buffer(data.length);
		var cmd = [];
		for (var i=0,j=0; i < data.length; i++){
			if (data[i] == 255) {//IAC
				i++;
				switch (data[i]) {
					case 251: //Will
					case 252: //Won't
					case 253: //Do
					case 254: //Don't
						cmd.push([data[i],data[i+1]]);
						i++;
						break;
					case 250: //SB (Suboption)
						var lastcmd = cmd[cmd.length-1];
						if (lastcmd[1] == data[i+1]) {
							switch(data[i+1]) {
								case 24: //Terminal Type
									switch(data[i+2]) {
										case 0: //my Terminal Type
											if (data[i+3] != 255) {
												for (var k=i+3; data[k] != 255; k++);
												lastcmd.push(data[i+2], data.toString('ascii',i+3,k));
												i=k-1;
											} else {
												lastcmd.push(data[i+2]);
												i+=2;
											}
											break;
										case 1: //Send your Terminal Type
											lastcmd.push(data[i+2]);
											i+=2;
											break;
										default:
											break;
									}
									break;
								case 31: //Negotiate windows size
									lastcmd.push((data[i+2]<<8)+data[i+3], (data[i+4]<<8)+data[i+5]);
									i+=5;
									break;
								default:
									break;	
							}
						}
						break;
					case 240: //SE (Suboption End)
					default:
						break;	
				}
			} else {
				buf[j++] = data[i];
			}
		}
		buf.length = j;
		return {'data':buf, 'cmd':cmd};
	},
	cmd2data: function (cmd) {
		var data = new Buffer(100);
		var i=0;
		cmd.forEach(function(entry) {
			switch (entry[0]) {
					case 251: //Will
					case 252: //Won't
					case 253: //Do
					case 254: //Don't
						data[i++] = 255;
						data[i++] = entry[0];
						data[i++] = entry[1];
						if (entry[2] !== undefined) {
							data[i++] = 255;
							data[i++] = 250;
							data[i++] = entry[1];
							switch (entry[1]) {
								case 24:
									data[i++] = entry[2];
									switch (entry[2]) {
										case 0:
											if (entry[3] !== undefined) {
												data.write(entry[3], i, entry[3].length);
												i += entry[3].length;
											}
											break;
										case 1:
										default:
											break;
									}
									break;
								case 31:
									if (entry[3] !== undefined) {
										data[i++] = entry[2] / 255;
										data[i++] = entry[2] % 255;
										data[i++] = entry[3] / 255;
										data[i++] = entry[3] % 255;
									}
									break;
								default:
									break;
							}
						}
						break;
					default:
						break;
			}
		});
		data.length = i;
		return data;
	}
};

