(function () {
	window.addEventListener('load', function () {
		var bell = document.getElementById('bell');
		var html5Test = document.getElementById('html5-test');
		var isHTML5Restricted;

		if (html5Test.canPlayType) {
			html5Test.load();
			html5Test.play();
			isHTML5Restricted = html5Test.paused;
		}

		if (isHTML5Restricted) {
			swal({
				title: "Welcome!",
				text: "Please click OK to continue.",
				type: "info"
			}, function () {
				bell.play();
				setTimeout(function () {
					bell.pause();
				}, 80);
			});
		}

		var socket = io.connect();

		var state;

		function isBingo (state) {
			return (state.q % 5 === 0 && state.q > 0) ||
				(state.c % 5 === 0 && state.c > 0) ||
				(state.v % 5 === 0 && state.v > 0);
		};

		function representState () {
			for (var key in state) {
				if (state.hasOwnProperty(key)) {
					document.getElementById('score-' + key).innerHTML = state[key] + ' ' + key.toUpperCase();
				}
			}
		};

		socket.on('background', function (background) {
			document.body.style.backgroundImage = 'url(' + background + ')';
		});

		socket.on('bell', function () {
			bell.currentTime = 0.1;
			bell.play();
		});

		socket.on('state', function (newState) {
			// If the state is not set for the first time, there is a bingo
			if (state && isBingo(newState)) {
				bell.currentTime = 0.1;
				bell.play();
			}

			state = newState;

			representState()
		});

		socket.on('reset state', function (newState) {
			state = newState;

			representState();
		});
	});
})();