'use strict';

/**
 * LectureBingo Server-side component
 */

const fs = require('fs');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const bodyParser = require('body-parser');

const env = require('./env');
let controlKey;

let connectionsCount = 0;

fs.readFile(__dirname + '/' + env.controlKeyFile, 'utf8', (err, data) => {
	if (!err)
		controlKey = data;
});

let state = {
	q: 0,
	c: 0,
	v: 0,
	s: 0
};

app.all('/control', (req, res, next) => {
	res.header("Access-Control-Allow-Origin", '*');
	res.header('Access-Control-Allow-Methods', 'POST');
	res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
	next();
});

app.post('/control', bodyParser.json(), (req, res) => {
	if (!controlKey && typeof req.body.key === 'string' && req.body.key.length > 5) {
		controlKey = req.body.key;
		fs.writeFile(__dirname + '/' + env.controlKeyFile, controlKey, (err) => {});
	}

	if (!controlKey)
		return res.sendStatus(401);

	if (req.body.key !== controlKey)
		return res.sendStatus(401);

	let input = req.body.command;
	if (input.indexOf('setall') === 0) {
		let values = input.split(' ').slice(1);
		if (values.length === 4) {
			state = {
				q: values[0] * 1,
				c: values[1] * 1,
				v: values[2] * 1,
				s: values[3] * 1
			};

			res.send('Updated');

			io.sockets.emit('reset state', state);
		}
		else
			res.send('Usage: setall q c v s');
	}

	else if (input.indexOf('add') === 0) {
		let values = input.split(' ').slice(1);
		if (values.length === 1 && ['q', 'c', 'v'].indexOf(values[0]) > -1) {
			state[values[0]] ++;
			if (state[values[0]] % 5 === 0)
				state.s ++;

			res.send('Updated');

			io.sockets.emit('state', state);
		}
		else
			res.send('Usage: add q|c|v');
	}

	else if (input === 'get')
		res.send(JSON.stringify(state, false, 4));

	else if (input === 'reload') {
		io.sockets.emit('reload', false);
		res.send('Reload event emitted');
	}

	else if (input === 'bell') {
		io.sockets.emit('bell');
		res.send('Rung bell');
	}

	else if (input === 'stats')
		res.send('Connected client count: ' + connectionsCount);

	else
		res.send('Commands: setall, add, get, usage, bell, reload');
});

io.set('origins', '*:*');

io.on('connection', (socket) => {
	connectionsCount ++;

	socket.emit('state', state);

	socket.on('disconnect', () => {
		connectionsCount --;
	});
});

server.listen(env.port, env.ip);
