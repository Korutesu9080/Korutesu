/*
Rainbow Splash Stim Toy – Perlenspiel 3.3.x
By Jason Cortez
*/

"use strict";

/* =======================
   COLOR PALETTES
======================= */

const PALETTES = [
	// Classic rainbow
	[
		PS.COLOR_RED,
		PS.COLOR_ORANGE,
		PS.COLOR_YELLOW,
		PS.COLOR_GREEN,
		PS.COLOR_CYAN,
		PS.COLOR_BLUE,
		PS.COLOR_PURPLE
	],

	// Pastel
	[
		0xFFB3BA,
		0xFFDFBA,
		0xFFFFBA,
		0xBAFFC9,
		0xBAE1FF
	],

	// Neon
	[
		0xFF005D,
		0xFFFB00,
		0x00FF9C,
		0x00B3FF,
		0x9D00FF
	]
];

let paletteIndex = 0;
let COLOR_LIST = PALETTES[paletteIndex];

/* =======================
   GAME STATE
======================= */

let currentIndex = 0;
let timerId = 0;

let centerX = 0;
let centerY = 0;
let radius = 1;

/* =======================
   SOUNDS
======================= */

let clickSound = "fx_click";
let spreadSound = "fx_pop";

/* =======================
   SPREAD LOGIC
======================= */

const spreadTick = function () {
	let color = COLOR_LIST[currentIndex % COLOR_LIST.length];
	currentIndex++;

	let changed = false;

	if (centerX - radius >= 0) {
		PS.color(centerX - radius, centerY, color);
		changed = true;
	}
	if (centerX + radius < 24) {
		PS.color(centerX + radius, centerY, color);
		changed = true;
	}
	if (centerY - radius >= 0) {
		PS.color(centerX, centerY - radius, color);
		changed = true;
	}
	if (centerY + radius < 24) {
		PS.color(centerX, centerY + radius, color);
		changed = true;
	}

	if (changed) {
		PS.audioPlay(spreadSound, { volume: 0.2 });
		radius++;
	} else {
		PS.timerStop(timerId);
		timerId = 0;
	}
};

/* =======================
   INIT
======================= */

PS.init = function () {
	PS.gridSize(24, 24);

	// Dark background for contrast
	PS.color(PS.ALL, PS.ALL, 0x202020);
	PS.border(PS.ALL, PS.ALL, 0);

	PS.statusText("Click to splash | 1–3 palettes");

	PS.audioLoad(clickSound);
	PS.audioLoad(spreadSound);
};

/* =======================
   INPUT
======================= */

PS.touch = function (x, y) {
	currentIndex = 0;
	radius = 1;

	centerX = x;
	centerY = y;

	PS.color(x, y, COLOR_LIST[0]);
	PS.audioPlay(clickSound, { volume: 0.3 });

	if (timerId) {
		PS.timerStop(timerId);
	}

	timerId = PS.timerStart(8, spreadTick);
};

PS.keyDown = function (key) {
	if (key === 49) paletteIndex = 0; // 1
	if (key === 50) paletteIndex = 1; // 2
	if (key === 51) paletteIndex = 2; // 3

	COLOR_LIST = PALETTES[paletteIndex];
};

/* =======================
   UNUSED EVENTS
======================= */

PS.release = PS.enter = PS.exit = PS.exitGrid =
PS.keyUp = PS.input = function () {};
