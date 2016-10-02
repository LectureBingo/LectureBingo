'use strict';

/**
 * Command line client for LectureBingo
 */

const request = require('request');
const env = require('./env');

let endpoint;
const controlKey = env.controlKey;

let busy = false;

console.log("Enter endpoint: (i.e. bingo.com:5000, fgt.nl)")

let stdin = process.openStdin();
stdin.addListener('data', (d) => {
	if (busy) {
		console.log('Still processing...');
		return;
	}
	let input = d.toString().trim();

	if (!endpoint) {
		endpoint = 'http://' + input + '/control';
		sendCommand('usage');
		return;
	}
	sendCommand(input);
});

function sendCommand (command) {
	busy = true;

	request({
		url: endpoint,
		body: {
			key: controlKey,
			command: command
		},
		method: 'POST',
		json: true
	}, (err, response, body) => {
		busy = false;
		console.log(body);
	});
};