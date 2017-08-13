function Stopwatch(elem) {
	var time = 0;
	var interval;
	var offset;
	var delay = 10;

	function update () {
		if (this.isOn) {
			time += delta(); 
		}
		var formattedTime = timeFormatter(time);
		elem.textContent = formattedTime;
	};
	function delta () {
		var now = Date.now();
		var timePassed = now - offset;
		offset = now;
		return timePassed;
	};
	function timeFormatter (timeInMilliseconds) {
		var time = new Date(timeInMilliseconds);
		var days = Math.floor(time / 8.64e+7).toString();
		var hours = Math.floor(time / 3.6e+6 % 24).toString();
		var minutes = Math.floor(time / 6e+4 % 60).toString();
		var seconds = Math.floor(time / 1000 % 60).toString();
		var milliseconds = (time % 1000).toString();
		if (days.length < 2) {
			days = '0' + days;
		}
		if (hours.length < 2) {
			hours = '0' + hours;
		}
		if (minutes.length < 2) {
			minutes = '0' + minutes;
		}
		if (seconds.length < 2) {
			seconds = '0' + seconds;
		}
		while (milliseconds.length < 3) {
			milliseconds = '0' + milliseconds;
		}
		return days + ' : ' + hours + ' : ' + minutes + ' : ' + seconds + ' : ' + milliseconds;
	};

	this.isOn = false;

	this.start = function () {
		if (!this.isOn) {
			interval = setInterval(update.bind(this), delay);
			offset = Date.now();
			this.isOn = true;
		}
	};

	this.stop = function () {
		if (this.isOn) {
			clearInterval(interval);
			interval = null;
			this.isOn = false;
		}
	};

	this.reset = function () {
		this.isOn = false;
		time = 0;
		clearInterval(interval);
		interval = null;
		update();
	};
}