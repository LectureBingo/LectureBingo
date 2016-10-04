(function () {
	window.addEventListener('load', function () {
		var bell = document.getElementById('bell');
		var html5Test = document.getElementById('html5-test');

		// Detect whether HTML5 audio playback is restricted
		if (html5Test.canPlayType) {
			html5Test.load();
			html5Test.play();

			// HTML5 is restrictive
			if (html5Test.paused) {
				swal({
					title: "Welcome!",
					text: "Please click Continue. This is necessary for the bell to work on mobile devices!",
					confirmButtonText: "Continue",
					type: "info"
				}, function () {
					// Play the bell sound
					bell.play();
					setTimeout(function () {
						// Seek to right before the end of the track to make
						// the notification on androids disappear
						bell.onpause = function () {
							bell.currentTime = bell.duration - 0.00001;
							bell.play();
							bell.onpause = null;
						};

						bell.pause();
					}, 80);
				});
			}
		}

		// Connect to socket.io server
		var socket = io.connect();

		// Variable that'll hold the state object
		var state;

		// Function that checks whether a state has a bingo
		function isBingo (newState, state) {
			return (newState.q % 5 === 0 && newState.q > 0 && state.q % 5 !== 0) ||
				(newState.c % 5 === 0 && newState.c > 0 && state.c % 5 !== 0) ||
				(newState.v % 5 === 0 && newState.v > 0 && state.v % 5 !== 0);
		};

		// Shows the state in the DOM
		function representState () {
			for (var key in state) {
				if (state.hasOwnProperty(key)) {
					document.getElementById('score-' + key).innerHTML = state[key] + ' ' + key.toUpperCase();
				}
			}
		};

		// Set the background to the one the socket.io server recommends us
		socket.on('background', function (background) {
			document.body.style.backgroundImage = 'url(' + background + ')';
		});

		// Ring the bell when a bell event is received
		socket.on('bell', function () {
			bell.currentTime = 0.1;
			bell.play();
		});

		// New state received
		socket.on('state', function (newState) {
			// If the state variable is not empty, and the new state has a bingo,
			// ring the bell!
			if (state && isBingo(newState, state)) {
				bell.currentTime = 0.1;
				bell.play();
			}

			state = newState;

			representState()
		});

		socket.on('reload', function (parent) {
			if (parent) {
				parent.location.reload();
			}
			else {
				location.reload();
			}
		})

		// The admin reset the state to some values, don't check for bingo
		socket.on('reset state', function (newState) {
			state = newState;

			representState();
		});
	});
})();