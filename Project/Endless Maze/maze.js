var mazeMatrix, mazeTable, prev, size, setNum, level, pR, pC, pRM, pCM, tmp;
var setSequenceM, setSequence;
var addedResizeListener = false;
var addedMoveListener = false;
var bot = false;
var botOn, done, steps;
var timer = document.getElementById('timer');
var toggle = document.getElementById('toggle');
var reset = document.getElementById('reset');
var botButtons = document.getElementById('wallFollower');
var list = document.getElementById('runtime');
var pauseAble = 3
var pauseLeft = pauseAble;
var interval = 0;
var speed = 0;

function gameStart() {
	prev = 0;
	size = 1;
	setNum = -1;
	level = 0;
	mazeTable = document.createElement('TABLE');
	if (document.body.getElementsByTagName('TABLE')[0] != null) {
		document.body.removeChild(document.body.getElementsByTagName('TABLE')[0]);
	}
	if (!addedResizeListener) {
		window.addEventListener('resize', resize);
		addedResizeListener = true;
	}
	if (bot && addedMoveListener) {
		removeMoveListener();
		addedMoveListener = false;
	} else if (!bot && !addedMoveListener) {
		addMoveListener();
		addedMoveListener = true;
	}
	document.body.appendChild(createMaze());
}

function createMaze() {
	var floor = size * 2 + 1;
	var i, j;

	if (++setNum > 3) setNum = 0;

	mazeMatrix = [];

	// Make Matrix
	for (i = 0; i < floor; i++) {
		mazeMatrix[i] = new Array(floor).fill(1);
	}

	// Make Grid
	for (i = 1; i < floor - 1; i += 2) {
		for (j = 1; j < floor - 1; j += 2) {
			mazeMatrix[i][j] = 0;
		}
	}

	// Generate Maze
	var set = new Array(size).fill(-1);
	var current = new Array(size).fill(-1);
	var next = new Array(size).fill(-1);
	var height = new Array(size).fill(0);
	var x, iTmp;
	for (i = 0; i < size - 1; i++) {
		x = 0;
		iTmp = i * 2 + 1;
		// Assigning Set Number
		for (j = 0; j < size; j++) {
			if (current[j] < 0) current[j] = x++;
			else if (set[current[j]] < 0) {
				set[current[j]] = x;
				current[j] = x++;
			} else {
				current[j] = set[current[j]];
			}
		}
		// Horizontal
		set.fill(-1);
		for (j = 0; j < size - 1; j++) {
			// Lable the current[j+1] to the set it belong to
			if ((x = set[current[j+1]]) > -1) {
				while (set[x] > -1) x = set[x];
				current[j+1] = x;
			}
			// Merge? Not merge?
			if (current[j] != current[j+1] && Math.random() < 0.5) {
				if (height[current[j]] > height[current[j+1]]) {
					set[current[j+1]] = current[j];
					current[j+1] = current[j];
				} else if (height[current[j]] < height[current[j+1]]) {
					set[current[j]] = current[j+1];
				} else {
					set[current[j+1]] = current[j];
					current[j+1] = current[j];
					height[current[j]]++;
				}
				// Add wall to matrix
				mazeMatrix[iTmp][(j+1)*2] = 0;
			}
		}
		// Re-number and group set together
		for (j = 0; j < size; j++) {
			if ((x = set[current[j]]) > -1) {
				while (set[x] > -1) x = set[x];
				set[current[j]] = x;
				current[j] = x;
			}
		}
		// Vertical
		set.fill(-1);
		height.fill(0);
		for (j = 0; j < size; j++) {
			if (Math.random() < 0.5) {
				mazeMatrix[iTmp+1][j*2+1] = 0;
				next[j] = current[j];
				height[current[j]]++;
			} else if (set[current[j]] < 0) {
				set[current[j]] = j;
			} else if (height[current[j]] == 0 && Math.random() < 0.2) {
				set[current[j]] = j;
			}
		}
		// Make sure each set have at least one vertical connection
		for (j = 0; j < size; j++) {
			if (set[j] > -1 && height[j] == 0) {
				mazeMatrix[iTmp+1][set[j]*2+1] = 0;
				next[set[j]] = j;
			}
		}
		tmp = current;
		current = next;
		next = tmp;
		next.fill(-1);
		set.fill(-1);
		height.fill(0);
	}
	// Handle the last row
	iTmp += 2;
	for (j = 0; j < size - 1; j++) {
		if ((x = set[current[j+1]]) > -1) {
			while (set[x] > -1) x = set[x];
			current[j+1] = x;
		}
		if (current[j+1] < 0) {
			current[j+1] = current[j];
			mazeMatrix[iTmp][(j+1)*2] = 0;
		} else if (current[j] < 0) {
			mazeMatrix[iTmp][(j+1)*2] = 0;
		} else if (current[j] != current[j+1]) {
			if (height[current[j]] > height[current[j+1]]) {
				set[current[j+1]] = current[j];
				current[j+1] = current[j];
			} else if (height[current[j]] < height[current[j+1]]) {
				set[current[j]] = current[j+1];
			} else {
				set[current[j+1]] = current[j];
				current[j+1] = current[j];
				height[current[j]]++;
			}
				// Add wall to matrix
				mazeMatrix[iTmp][(j+1)*2] = 0;
			}
		}

	// Make table from matrix
	var row, cell;
	switch (setNum) {
		case 0:
		for (i = 0; i < floor - 1; i++) {
			row = mazeTable.insertRow(i);
			for (j = 0; j < floor; j++) {
				cell = row.insertCell(-1);
				if (mazeMatrix[i][j]) cell.classList.add('wall');
			}
		}
		if (prev == 0) {
			row = mazeTable.insertRow(i);
			for (j = 0; j < floor; j++) {
				cell = row.insertCell(-1);
				if (mazeMatrix[i][j]) cell.classList.add('wall');
			}
		}
		break;
		
		case 1:
		for (i = 0; i < floor; i++) {
			row = mazeTable.rows[i];
			for (j = 1; j < floor; j++) {
				cell = row.insertCell(-1);
				if (mazeMatrix[i][j]) cell.classList.add('wall');
			}
		}
		break;

		case 2:
		for (i = 1; i < floor; i++) {
			row = mazeTable.insertRow(-1);
			for (j = 0; j < floor; j++) {
				cell = row.insertCell(-1);
				if (mazeMatrix[i][j]) cell.classList.add('wall');
			}
		}
		break;
		
		case 3:
		for (i = 0; i < floor; i++) {
			row = mazeTable.rows[i];
			for (j = 0; j < floor - 1; j++) {
				cell = row.insertCell(j);
				if (mazeMatrix[i][j]) cell.classList.add('wall');
			}
		}
		break;
	}

	// Add player to the corrent location on the matrix
	setSequenceM = [
		[floor-1,1,1,floor-1],
		[1,0,floor-1,floor-2],
		[0,floor-2,floor-2,0],
		[floor-2,floor-1,0,1]
	];
	pRM = setSequenceM[setNum][0];
	pCM = setSequenceM[setNum][1];
	mazeMatrix[setSequenceM[setNum][2]][setSequenceM[setNum][3]] = 0;
	// Add player and goal to the corrent location on the table
	setSequence = [
		[floor-1,1,1,floor-1],
		[1,mazeTable.rows[0].cells.length-floor,floor-1,mazeTable.rows[0].cells.length-2],
		[mazeTable.rows.length-floor,floor-2,mazeTable.rows.length-2,0],
		[floor-2,floor-1,0,1]
	];
	pR = setSequence[setNum][0];
	pC = setSequence[setNum][1];
	mazeTable.rows[pR].cells[pC].className = '';
	mazeTable.rows[pR].cells[pC].classList.add('player');
	mazeTable.rows[setSequence[setNum][2]].cells[setSequence[setNum][3]].className = '';
	mazeTable.rows[setSequence[setNum][2]].cells[setSequence[setNum][3]].classList.add('goal');

	resize();

	return mazeTable;
}

function nextLevel() {
	var li = document.createElement('li');
	var text = 'Level : ';
	if (level.toString().length < 2) text += '0' + level++;
	else text += level++;
	if (bot) {
		text += ' Steps : ' + document.getElementById('timer').textContent;
		text = text.substring(0, text.length - 6);
	} else text += ' Time : ' + document.getElementById('timer').textContent;
	li.appendChild(document.createTextNode(text));
	list.insertBefore(li, list.firstChild);
	if (level.toString().length < 2) text = 'Level : 0' + level;
	else text = 'Level : ' + level;
	document.getElementById('level').textContent = text;
	tmp = prev + size;
	prev = size;
	size = tmp;
	done = true;
	createMaze();
}

function moveControl(event) {
	if (event.keyCode) tmp = event.keyCode;
	else tmp = event;
	switch (tmp) {
		case 38: // Up
		case 87: // W
		if (pRM-1 == setSequenceM[setNum][2] && pCM == setSequenceM[setNum][3]) {
			mazeTable.rows[pR].cells[pC].className = '';
			mazeTable.rows[pR].cells[pC].classList.add('path');
			nextLevel();
		} else if (pRM-1 > -1 && mazeMatrix[pRM-1][pCM] < 1) {
			mazeTable.rows[pR].cells[pC].className = '';
			if (bot) {
				if (mazeMatrix[pRM-1][pCM] < 0) mazeTable.rows[pR].cells[pC].classList.add('trail');
				else {
					mazeMatrix[pRM][pCM] = -1;
					mazeTable.rows[pR].cells[pC].classList.add('pathBot');
				}
			} else {
				if (mazeMatrix[pRM-1][pCM] == -1) {
					mazeMatrix[pRM][pCM] = -2;
					mazeTable.rows[pR].cells[pC].classList.add('trail');
				} else {
					mazeMatrix[pRM][pCM] = -1;
					mazeTable.rows[pR].cells[pC].classList.add('path');
				}
			}
			mazeTable.rows[--pR].cells[pC].className = '';
			mazeTable.rows[pR].cells[pC].classList.add('player');
			pRM--;
		}
		break;

		case 40: // Down
		case 83: // S
		if (pRM+1 == setSequenceM[setNum][2] && pCM == setSequenceM[setNum][3]) {
			mazeTable.rows[pR].cells[pC].className = '';
			mazeTable.rows[pR].cells[pC].classList.add('path');
			nextLevel();
		} else if (pRM+1 < size*2+1 && mazeMatrix[pRM+1][pCM] < 1) {
			mazeTable.rows[pR].cells[pC].className = '';
			if (bot) {
				if (mazeMatrix[pRM+1][pCM] < 0) mazeTable.rows[pR].cells[pC].classList.add('trail');
				else {
					mazeMatrix[pRM][pCM] = -1;
					mazeTable.rows[pR].cells[pC].classList.add('pathBot');
				}
			} else {
				if (mazeMatrix[pRM+1][pCM] == -1) {
					mazeMatrix[pRM][pCM] = -2;
					mazeTable.rows[pR].cells[pC].classList.add('trail');
				} else {
					mazeMatrix[pRM][pCM] = -1;
					mazeTable.rows[pR].cells[pC].classList.add('path');
				}
			}
			mazeTable.rows[++pR].cells[pC].className = '';
			mazeTable.rows[pR].cells[pC].classList.add('player');
			pRM++;
		}
		break;
		
		case 37: // Left
		case 65: // A
		if (pRM == setSequenceM[setNum][2] && pCM-1 == setSequenceM[setNum][3]) {
			mazeTable.rows[pR].cells[pC].className = '';
			mazeTable.rows[pR].cells[pC].classList.add('path');
			nextLevel();
		} else if (pCM-1 > -1 && mazeMatrix[pRM][pCM-1] < 1) {
			mazeTable.rows[pR].cells[pC].className = '';
			if (bot) {
				if (mazeMatrix[pRM][pCM-1] < 0) mazeTable.rows[pR].cells[pC].classList.add('trail');
				else {
					mazeMatrix[pRM][pCM] = -1;
					mazeTable.rows[pR].cells[pC].classList.add('pathBot');
				}
			} else {
				if (mazeMatrix[pRM][pCM-1] == -1) {
					mazeMatrix[pRM][pCM] = -2;
					mazeTable.rows[pR].cells[pC].classList.add('trail');
				} else {
					mazeMatrix[pRM][pCM] = -1;
					mazeTable.rows[pR].cells[pC].classList.add('path');
				}
			}
			mazeTable.rows[pR].cells[--pC].className = '';
			mazeTable.rows[pR].cells[pC].classList.add('player');
			pCM--;
		}
		break;
		
		case 39: // Right
		case 68: // D
		if (pRM == setSequenceM[setNum][2] && pCM+1 == setSequenceM[setNum][3]) {
			mazeTable.rows[pR].cells[pC].className = '';
			mazeTable.rows[pR].cells[pC].classList.add('path');
			nextLevel();
		} else if (pCM+1 < size*2+1 && mazeMatrix[pRM][pCM+1] < 1) {
			mazeTable.rows[pR].cells[pC].className = '';
			if (bot) {
				if (mazeMatrix[pRM][pCM+1] < 0) mazeTable.rows[pR].cells[pC].classList.add('trail');
				else {
					mazeMatrix[pRM][pCM] = -1;
					mazeTable.rows[pR].cells[pC].classList.add('pathBot');
				}
			} else {
				if (mazeMatrix[pRM][pCM+1] == -1) {
					mazeMatrix[pRM][pCM] = -2;
					mazeTable.rows[pR].cells[pC].classList.add('trail');
				} else {
					mazeMatrix[pRM][pCM] = -1;
					mazeTable.rows[pR].cells[pC].classList.add('path');
				}
			}
			mazeTable.rows[pR].cells[++pC].className = '';
			mazeTable.rows[pR].cells[pC].classList.add('player');
			pCM++;
		}
		break;
	}
}

function addMoveListener() {
	document.addEventListener('keydown', moveControl, false);
	addedMoveListener = true;
}

function removeMoveListener() {
	document.removeEventListener('keydown', moveControl, false);
	addedMoveListener = false;
}

function resize() {
	var menu = document.getElementById('menu');
	menu.className = '';
	mazeTable.className = '';
	if (level == 0) {
		if (window.innerWidth > window.innerHeight) {
			menu.classList.add('right');
			if (window.innerWidth*(3/4) > window.innerHeight) mazeTable.classList.add('zeroL');
			else mazeTable.classList.add('zeroS');
		} else {
			menu.classList.add('up');
			if (window.innerHeight*(3/4) > window.innerWidth) mazeTable.classList.add('zeroL');
			else mazeTable.classList.add('zeroS');
		}
	} else if (window.innerWidth > window.innerHeight) {
		menu.classList.add('right');
		if (setNum % 2 == 0) {
			if (window.innerWidth*(3/4) > window.innerHeight*(610/987)) mazeTable.classList.add('tallM');
			else mazeTable.classList.add('tallS');
		} else {
			if (window.innerWidth*(3/4) > window.innerHeight*(987/610)) mazeTable.classList.add('wideL');
			else mazeTable.classList.add('wideS');
		}
	} else {
		menu.classList.add('up');
		if (setNum % 2 == 1) {
			if (window.innerHeight*(3/4) > window.innerWidth*(610/987)) mazeTable.classList.add('wideM');
			else mazeTable.classList.add('wideS');
		} else {
			if (window.innerHeight*(3/4) > window.innerWidth*(987/610)) mazeTable.classList.add('tallL');
			else mazeTable.classList.add('tallS');
		}
	}
}

function wallFollower(back, cb) {
	var walkDone = function() {
		if (!done) {
			moveControl(back);
			moveControl(back);
			steps++;
		}
		if (cb) cb();
	}
	var walkS = function() {
		if (!done && back != 40 && pRM+1 < size*2+1 && !mazeMatrix[pRM+1][pCM]) {
			moveControl(40);
			moveControl(40);
			steps++;
			wallFollower(38, walkDone);
		} else walkDone();
	}
	var walkD = function() {
		if (!done && back != 39 && pCM+1 < size*2+1 && !mazeMatrix[pRM][pCM+1]) {
			moveControl(39);
			moveControl(39);
			steps++;
			wallFollower(37, walkS);
		} else walkS();
	}
	var walkW = function() {
		if (!done && back != 38 && pRM-1 > -1 && !mazeMatrix[pRM-1][pCM]) {
			moveControl(38);
			moveControl(38);
			steps++;
			wallFollower(40, walkD);
		} else walkD();
	}
	var walkA = function() {
		if (!done && back != 37 && pCM-1 > -1 && !mazeMatrix[pRM][pCM-1]) {
			moveControl(37);
			moveControl(37);
			steps++;
			wallFollower(39, walkW);
		} else walkW();
	}
	var timeOut = function() {
		if (++interval > speed) interval = 0;
		if (botOn) {
			if (interval) walkA();
			else setTimeout(walkA, 0);
		} else if (bot) setTimeout(timeOut, 100);
	}
	timer.textContent = steps.toLocaleString() + ' Steps';
	timeOut();
}

function botPause() {
	botOn = false;
	toggle.textContent = 'Resume';
}

function botResume() {
	botOn = true;
	toggle.textContent = 'Pause';
}

function pause() {
	stopwatch.stop();
	if (addedMoveListener) {
		removeMoveListener();
		addedMoveListener = false;
	}
	toggle.textContent = 'Resume (' + --pauseLeft + ')';
	document.body.getElementsByTagName('TABLE')[0].style.display = 'none';
}

function resume() {
	stopwatch.start();
	if (!addedMoveListener) {
		addMoveListener();
		addedMoveListener = true;
	}
	toggle.textContent = 'Pause (' + pauseLeft + ')';
	document.body.getElementsByTagName('TABLE')[0].style.display = 'table';
}

toggle.addEventListener('click', function() {
	if (bot && botOn) botPause();
	else if (bot && !botOn) botResume();
	else if (stopwatch.isOn && pauseLeft > 0) pause();
	else if (!stopwatch.isOn) resume();
});

reset.addEventListener('click', function() {
	if (bot) {
		bot = false;
		done = true;
		speed = 0;
		botButtons.textContent = 'Wall Follower';
		botButtons.className = '';
	}
	pauseLeft = pauseAble;
	stopwatch.reset();
	document.getElementById('level').textContent = 'Level : 00';
	toggle.textContent = 'Pause (3)';
	while (list.firstChild) list.removeChild(list.firstChild);
	gameStart();
	resume();
});

botButtons.addEventListener('click', function() {
	if (!bot) {
		bot = true;
		botOn = true;
		steps = 0;
		stopwatch.stop();
		timer.textContent = '0 Steps';
		document.getElementById('level').textContent = 'Level : 00';
		toggle.textContent = 'Pause';
		while (list.firstChild) list.removeChild(list.firstChild);
		botButtons.classList.add('on');
		botButtons.textContent = 'Speed x1';
		document.body.getElementsByTagName('TABLE')[0].style.display = 'table';
		gameStart();
		botNextLevel();
	} else {
		if ((speed = speed * 2 + 1) > 32) speed = 0;
		botButtons.textContent = 'Speed x' + (speed + 1);
	}
});

function botNextLevel() {
	if (bot) {
		done = false;
		if (setNum == 0) wallFollower(40, botNextLevel);
		else if (setNum == 1) wallFollower(37, botNextLevel);
		else if (setNum == 2) wallFollower(38, botNextLevel);
		else wallFollower(39, botNextLevel);
	}
}

var stopwatch = new Stopwatch(timer);
stopwatch.start();
gameStart();