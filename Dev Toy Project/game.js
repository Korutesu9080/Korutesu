/*
game.js for Perlenspiel 3.3.x
Last revision: 2022-03-15 (BM)
Perlenspiel is a scheme by Professor Moriarty (bmoriarty@wpi.edu).
This version of Perlenspiel (3.3.x) is hosted at <https://ps3.perlenspiel.net>
Perlenspiel is Copyright © 2009-22 Brian Moriarty.
This file is part of the standard Perlenspiel 3.3.x devkit distribution.
Perlenspiel is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
Perlenspiel is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.
You may have received a copy of the GNU Lesser General Public License
along with the Perlenspiel devkit. If not, see <http://www.gnu.org/licenses/>.
*/
/*
This JavaScript file is a template for creating new Perlenspiel 3.3.x games.
Any unused event-handling function templates can be safely deleted.
Refer to the tutorials and documentation at <https://ps3.perlenspiel.net> for details.
*/
/*
The following comment lines are for JSHint <https://jshint.com>, a tool for monitoring code quality.
You may find them useful if your development environment is configured to support JSHint.
If you don't use JSHint (or are using it with a configuration file), you can safely delete these two lines.
*/
/* jshint browser : true, devel : true, esversion : 6, freeze : true */
/* globals PS : true */
"use strict"; // Do NOT remove this directive!

// Flatten the original 3x3 color array into a 1D list for easy cycling
const COLOR_LIST = [
	PS.COLOR_GREEN, PS.COLOR_PURPLE, PS.COLOR_ORANGE,
	PS.COLOR_RED, PS.COLOR_BLUE, PS.COLOR_YELLOW,
	PS.COLOR_CYAN, PS.COLOR_GRAY, PS.COLOR_BLACK
];

// Game state variables
let currentIndex = 0;      // Current position in COLOR_LIST
let timerId = 0;           // ID of the active timer (0 = no timer)
let centerX = 0;           // X position of the last clicked bead (spread center)
let centerY = 0;           // Y position of the last clicked bead (spread center)
let leftFront = 0;         // Current front of leftward spread
let rightFront = 0;        // Current front of rightward spread
let upFront = 0;           // Current front of upward spread
let downFront = 0;         // Current front of downward spread

// The spreading function (called repeatedly by the timer)
const spreadTick = function () {
	let changed = false;
	let color;

	if (leftFront >= 0) {
		color = COLOR_LIST[currentIndex % COLOR_LIST.length];
		PS.color(leftFront, centerY, color);
		currentIndex += 1;
		leftFront -= 1;
		changed = true;
	}

	if (rightFront < 8) {
		color = COLOR_LIST[currentIndex % COLOR_LIST.length];
		PS.color(rightFront, centerY, color);
		currentIndex += 1;
		rightFront += 1;
		changed = true;
	}

	if (upFront >= 0) {
		color = COLOR_LIST[currentIndex % COLOR_LIST.length];
		PS.color(centerX, upFront, color);
		currentIndex += 1;
		upFront -= 1;
		changed = true;
	}

	if (downFront < 8) {
		color = COLOR_LIST[currentIndex % COLOR_LIST.length];
		PS.color(centerX, downFront, color);
		currentIndex += 1;
		downFront += 1;
		changed = true;
	}

	if (!changed) {
		PS.timerStop(timerId);
		timerId = 0;
	}
};

/*
PS.init( system, options )
Called once after engine is initialized but before event-polling begins.
*/
PS.init = function (system, options) {
	PS.gridSize(8, 8);

	// Start with a neutral gray grid so all colors are visible
	PS.color(PS.ALL, PS.ALL, PS.COLOR_GRAY);

	// Remove borders for a cleaner look
	PS.border(PS.ALL, PS.ALL, 0);

	PS.statusText("Trail Game");

	// Optional welcome message
	// PS.statusText( "Click any bead to spread rainbow trails!" );
};

/*
PS.touch ( x, y, data, options )
Called when a bead is clicked/touched.
This starts a new rainbow spread centered on the clicked bead.
*/
PS.touch = function (x, y, data, options) {
	// Reset color cycle for each new spread (starts with green in the center)
	currentIndex = 0;

	// Color the center bead first
	PS.color(x, y, COLOR_LIST[0]);
	currentIndex = 1;

	// Set up the spread fronts
	centerX = x;
	centerY = y;
	leftFront = x - 1;
	rightFront = x + 1;
	upFront = y - 1;
	downFront = y + 1;

	// Stop any previous spread
	if (timerId) {
		PS.timerStop(timerId);
	}

	// Start a new spread timer (12 ticks/second = fairly quick spread)
	timerId = PS.timerStart(12, spreadTick);
};

/* The remaining event handlers are left empty (you can delete them if you want) */

PS.release = function (x, y, data, options) {
	// Unused
};

PS.enter = function (x, y, data, options) {
	// Unused
};

PS.exit = function (x, y, data, options) {
	// Unused
};

PS.exitGrid = function (options) {
	// Unused
};

PS.keyDown = function (key, shift, ctrl, options) {
	// Unused
};

PS.keyUp = function (key, shift, ctrl, options) {
	// Unused
};

PS.input = function (sensors, options) {
	// Unused
};