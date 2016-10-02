(function () {
	window.addEventListener('load', function () {
		var input = document.getElementById('input');
		var setKey = document.getElementById('set_key');
		var _console = document.getElementById('console');
		var busy = false;

		function sendCommand (command) {
			busy = true;

			fetch('/control', {
				method: 'POST',
				headers: new Headers({
					'Content-Type': 'application/json; charset=UTF-8'
				}),
				body: JSON.stringify({ key: localStorage['lecturebingo_control_key'], command: command })
			}).then(function (response) {
				return response.text();
			}).then(function (text) {
				var span = document.createElement('span');
				span.innerHTML = text + '<br>';
				_console.insertBefore(span, _console.children[0]);
				busy = false;
			});
		};

		sendCommand('usage');

		input.addEventListener('keydown', function (e) {
			if (e.which === 13 && !busy) {
				sendCommand(input.value.trim());
				input.value = '';
			}
		});

		setKey.addEventListener('click', function () {
			localStorage['lecturebingo_control_key'] = prompt("Key please!");
		});
	});
})();