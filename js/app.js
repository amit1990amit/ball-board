var WALL = 'WALL';
var FLOOR = 'FLOOR';
var BALL = 'BALL';
var GAMER = 'GAMER';
var GLUE = 'GLUE'

var GAMER_IMG = '<img src="img/gamer.png">';
var BALL_IMG = '<img src="img/ball.png">';
var GLUE_IMG = '<img src="img/candy.png">'; /// its glue
var GLUED_PLAYER_IMG = '<img src="img/gamer-purple.png"></img>';

var ballInterval;
var glueInterval;
var gIsStuck = false;


var gIsGameRuning;
var gBallCount;
var gBallOnBoard;
var gGamerPos = { i: 2, j: 9 };
var gBoard;



function renderGlue() {
	var row = getRandomInteger(1, 8);
	var col = getRandomInteger(1, 10);

	if (!gBoard[row][col].gameElement) {
		gBoard[row][col].gameElement = GLUE;
		renderCell({ i: row, j: col }, GLUE_IMG);
		setTimeout(function () {
			if (gBoard[row][col].gameElement === GAMER) return;
			removeGlue(row, col, null);
		}, 3000)


	}

}

function removeGlue(row, col,element) {
	gBoard[row][col].gameElement = element;
	if (element === null) renderCell({ i: row, j: col }, '');
	else renderCell({ i: row, j: col }, element);

}

function stepGlue(pos) {

	gIsStuck = true;
	setTimeout(() => {
		gIsStuck = false;
	}, 3000);
	renderCell(pos, GLUED_PLAYER_IMG);
}





function init() {
	gBallCount = 0;
	gBallOnBoard = 0;
	gIsGameRuning = true;
	gBoard = buildBoard();

	if (ballInterval) clearInterval(ballInterval)
	if (glueInterval) clearInterval(glueInterval)

	var elRestart = document.querySelector('.restart');
	elRestart.innerHTML = ''

	renderBoard(gBoard);
	ballInterval = setInterval(renderBall, 5000)
	glueInterval = setInterval(renderGlue, 5000)
}

function renderBall() {
	var row = getRandomInteger(1, 8);
	var col = getRandomInteger(1, 10);

	if (!gBoard[row][col].gameElement) {
		gBoard[row][col].gameElement = BALL;
		renderCell({ i: row, j: col }, BALL_IMG)
		gBallOnBoard++;
	}
}

function buildBoard() {
	// Create the Matrix 10 * 12 
	var board = new Array(10);
	for (var i = 0; i < board.length; i++) {
		board[i] = new Array(12);
	}
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			// Put FLOOR everywhere and WALL at edges
			board[i][j] = { type: 'FLOOR', gameElement: null }
			if (i === 0 || j === 0 ||
				i === board.length - 1 || j === board[0].length - 1) {
				board[i][j].type = WALL;
			}
		}
	}
	// Place the gamer
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

	board[0][5].type = FLOOR;
	board[9][5].type = FLOOR;
	board[4][0].type = FLOOR;
	board[4][11].type = FLOOR;

	board[3][3].gameElement = BALL;
	board[3][8].gameElement = BALL;
	gBallOnBoard += 2;

	console.table(board);
	return board;
}


// Render the board to an HTML table
function renderBoard(board) {

	var strHTML = '';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];

			var cellClass = getClassName({ i: i, j: j }) // e.g. - cell-3-8

			if (currCell.type === FLOOR) cellClass += ' floor';
			else if (currCell.type === WALL) cellClass += ' wall';

			strHTML += '\t<td class="cell ' + cellClass + '"  onclick="moveTo(' + i + ',' + j + ')" >\n';

			if (currCell.gameElement === GAMER) {
				strHTML += GAMER_IMG;
			} else if (currCell.gameElement === BALL) {
				strHTML += BALL_IMG;
			}

			strHTML += '\t</td>\n';
		}
		strHTML += '</tr>\n';
	}
	// console.log('strHTML is:');
	// console.log(strHTML);
	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;
}




// Move the player to a specific location
function moveTo(i, j) {

	console.log('is stuck', gIsStuck);
	
	if (gIsStuck) return;
	console.log('is stuck2', gIsStuck);
	console.log(gBallOnBoard);
	var targetCell = gBoard[i][j];
	if (targetCell.type === WALL) return;

	// Calculate distance to ake sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i);
	var jAbsDiff = Math.abs(j - gGamerPos.j);

	// If the clicked Cell is one of the four allowed
	// if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {
	if (iAbsDiff + jAbsDiff === 1) {
		console.log('Moving to: ', i, j);

		if (targetCell.gameElement === BALL) {
			gBallCount++;
			gBallOnBoard--;
			var elBallCount = document.querySelector('span')
			elBallCount.innerText = gBallCount;

		}
		

		// Move the gamer

		// Update the MODEL and DOM

		gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
		renderCell(gGamerPos, '');

		gGamerPos.i = i;
		gGamerPos.j = j;

		if (i === 0) {
			gGamerPos.i = gBoard.length - 1;
		} else if (i === gBoard.length - 1) {
			gGamerPos.i = 0;
		}

		if (j === 0) {
			gGamerPos.j = gBoard[0].length - 1;
		} else if (j === gBoard[0].length - 1) {
			gGamerPos.j = 0;
		}

		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

		if(targetCell.gameElement === GLUE) {
			stepGlue(gGamerPos);
			setTimeout(() => {
				renderCell(gGamerPos, GAMER_IMG);
			}, 3000);		
		}else {
			renderCell(gGamerPos, GAMER_IMG);
		}
		

	} else console.log('TOO FAR', iAbsDiff, jAbsDiff);

}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	if (gBallOnBoard === 0) {
		if (gIsGameRuning) {
			var winSound = new Audio('sounds/sound.mp3');
			winSound.play();
			gIsGameRuning = false;
		}

		var elRestart = document.querySelector('.restart');
		elRestart.innerHTML = 'Restart?'
		clearInterval(ballInterval);
	}
	var cellSelector = '.' + getClassName(location)
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {

	var i = gGamerPos.i;
	var j = gGamerPos.j;


	switch (event.key) {
		case 'ArrowLeft':
			moveTo(i, j - 1);
			break;
		case 'ArrowRight':
			moveTo(i, j + 1);
			break;
		case 'ArrowUp':
			moveTo(i - 1, j);
			break;
		case 'ArrowDown':
			moveTo(i + 1, j);
			break;

	}

}

// Returns the class name for a specific cell
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}

function getRandomInteger(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}