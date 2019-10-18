require('sleepless');
const request = require('request');
const firstline = require('firstline');
const fs = require('fs');
const readline = require('readline');
const clear = console.clear;

var rl;
var game_id = "";

var init = function() {
	clear();
	firstline('./id.txt')
	.then(line => {
		game_id = line;
		console.log("RESUMING GAME: " + game_id);
		rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			terminal: false
		});
		read();
	})
	.catch(e => {
		let url = 'https://swords.sleepless.com/api/?act=NEW&module=Angry_Dragon';
		request.get(url, {}, (err, response, body) => {
			let info = j2o(body).data;
			fs.writeFile('id.txt', info.game_id, (err) => {
				if(err) log('could not start a new game');
				init();
			});
			return;
		});	
	});
}

var lookup = function(cmd, cb) {
	let url = 'https://swords.sleepless.com/api/?act=PLAY&game_id=' + game_id + "&cmd=" + cmd;
	request.get(url, {}, (err, response, body) => {
		log('\n\t' + j2o(body).data.text + '\n');
		cb();
		return;
	});	
}

var read = function() {
	rl.question('> ', answer => {
		let cmd = answer;
		let lookup_happened = false;
		switch(cmd) {
			case 'quit':
			case 'q':
				clear();
				rl.close();
				process.exit(0);
				break;
			case 'new':
				lookup("MODULE_INFO", read);
				lookup_happened = true;
				break;
			case 'clear':
				clear();
				break;
			default:
				lookup(cmd, read);
				lookup_happened = true;
				break;
		}
		if(!lookup_happened) // Just so that read doesn't get called twice since lookup needs a callback
			read();
	});
}

init();
