'use strict';

/**
 * LectureBingo
 */

const fs = require('fs');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const bodyParser = require('body-parser');

const env = require('./env');
const controlKey = env.controlKey;
const port = env.port;

const staticDir = __dirname + '/' + env.staticDir;
const bowerDir = __dirname + '/' + 'bower_components/';

let state = {
	q: 0,
	c: 0,
	v: 0,
	s: 0
};

app.post('/control', bodyParser.json(), (req, res) => {
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

	else if (input === 'bell') {
		io.sockets.emit('bell');
		res.send('Rung bell');
	}

	else
		res.send('Commands: setall, add, get, usage, bell');
});

app.use('/', express.static(staticDir));
app.use('/', express.static(bowerDir));


io.on('connection', (socket) => {
	socket.emit('state', state);

	fs.readdir(staticDir + 'backgrounds/', (err, files) => {
		files = files.filter((file) => {
			return file.endsWith('.jpg');
		});

		socket.emit('background', '/backgrounds/' + files[Math.floor(Math.random() * files.length)]);
	});
});

server.listen(port);
