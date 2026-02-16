/* jshint browser : true, devel : true, esversion : 6, freeze : true */
/* globals PS : true */
"use strict";

const GRID_WIDTH = 14;
const GRID_HEIGHT = 14;

const PLAYER_START = { x: 0, y: 0 };

const ENEMY_STARTS = [
    { x: 13, y: 0 },
    { x: 0, y: 13 }
];

let level = 0;
let player;
let enemies;
let gems;
let door;
let walls;
let gameOver = false;

/* ---------- LEVEL DATA ---------- */

const LEVELS = [

    /* LEVEL 1 */
    {
        gems: [
            { x: 2, y: 2 }, { x: 11, y: 1 },
            { x: 6, y: 6 }, { x: 9, y: 4 },
            { x: 1, y: 11 }, { x: 12, y: 10 }
        ],
        walls: [
            { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 },
            { x: 3, y: 4 }, { x: 3, y: 5 },
            { x: 7, y: 1 }, { x: 8, y: 1 }, { x: 9, y: 1 },
            { x: 5, y: 4 }, { x: 6, y: 4 }, { x: 7, y: 4 },
            { x: 5, y: 5 }, { x: 7, y: 5 }, { x: 7, y: 6 }
        ]
    },

    /* LEVEL 2 */
    {
        gems: [
            { x: 1, y: 3 }, { x: 12, y: 2 },
            { x: 5, y: 10 }, { x: 9, y: 6 },
            { x: 2, y: 12 }, { x: 11, y: 11 }
        ],
        walls: [
            { x: 4, y: 0 }, { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 },
            { x: 8, y: 4 }, { x: 8, y: 5 }, { x: 8, y: 6 },
            { x: 2, y: 8 }, { x: 3, y: 8 }, { x: 4, y: 8 },
            { x: 10, y: 9 }, { x: 11, y: 9 }
        ]
    },

    /* LEVEL 3 */
    {
        gems: [
            { x: 2, y: 1 }, { x: 12, y: 3 },
            { x: 6, y: 5 }, { x: 10, y: 8 },
            { x: 3, y: 11 }, { x: 11, y: 12 }
        ],
        walls: [
            { x: 5, y: 0 }, { x: 5, y: 1 }, { x: 5, y: 2 },
            { x: 7, y: 3 }, { x: 8, y: 3 }, { x: 9, y: 3 },
            { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 },
            { x: 9, y: 10 }, { x: 10, y: 10 }
        ]
    },

    /* LEVEL 4 */
    {
        gems: [
            { x: 1, y: 2 }, { x: 12, y: 4 },
            { x: 6, y: 9 }, { x: 9, y: 2 },
            { x: 3, y: 12 }, { x: 10, y: 11 }
        ],
        walls: [
            { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 },
            { x: 6, y: 6 }, { x: 7, y: 6 }, { x: 8, y: 6 },
            { x: 5, y: 10 }, { x: 6, y: 10 }, { x: 7, y: 10 }
        ]
    },

    /* LEVEL 5 */
    {
        gems: [
            { x: 2, y: 3 }, { x: 11, y: 2 },
            { x: 6, y: 6 }, { x: 10, y: 9 },
            { x: 1, y: 11 }, { x: 12, y: 12 }
        ],
        walls: [
            { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 },
            { x: 8, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 7 },
            { x: 3, y: 9 }, { x: 4, y: 9 }, { x: 5, y: 9 }
        ]
    }

];

/* ---------- COLORS ---------- */

const PLAYER_COLOR = PS.COLOR_CYAN;
const ENEMY_COLOR = PS.COLOR_MAGENTA;
const GEM_COLOR = PS.COLOR_YELLOW;
const WALL_COLOR = PS.COLOR_BLACK;
const DOOR_COLOR_LOCKED = PS.COLOR_RED;
const DOOR_COLOR_UNLOCKED = PS.COLOR_GREEN;
const EMPTY_COLOR = PS.COLOR_GRAY;

/* ---------- INIT ---------- */

PS.init = function () {
    PS.gridSize(GRID_WIDTH, GRID_HEIGHT);
    PS.border(PS.ALL, PS.ALL, 0);
    loadLevel();
};

/* ---------- LOAD LEVEL ---------- */

function loadLevel() {

    let data = LEVELS[level];

    player = { ...PLAYER_START };
    enemies = ENEMY_STARTS.map(e => ({ ...e }));

    gems = data.gems.map(g => ({ ...g, collected: false }));
    walls = data.walls.map(w => ({ ...w }));

    door = { x: 13, y: 13, unlocked: false };

    gameOver = false;

    PS.statusText(`Level ${level + 1} - Collect all gems! (Press 1 to reset)`);
    drawGrid();
}

/* ---------- DRAW ---------- */

function drawGrid() {

    PS.color(PS.ALL, PS.ALL, EMPTY_COLOR);

    walls.forEach(w => PS.color(w.x, w.y, WALL_COLOR));

    gems.forEach(g => {
        if (!g.collected) {
            PS.color(g.x, g.y, GEM_COLOR);
        }
    });

    PS.color(
        door.x,
        door.y,
        door.unlocked ? DOOR_COLOR_UNLOCKED : DOOR_COLOR_LOCKED
    );

    enemies.forEach(e => {
        PS.color(e.x, e.y, ENEMY_COLOR);
    });

    PS.color(player.x, player.y, PLAYER_COLOR);
}

function isWall(x, y) {
    return walls.some(w => w.x === x && w.y === y);
}

/* ---------- GAME LOGIC ---------- */

function checkGem() {

    gems.forEach(g => {
        if (!g.collected && g.x === player.x && g.y === player.y) {
            g.collected = true;
            PS.audioPlay("fx_coin1");
        }
    });

    if (gems.every(g => g.collected)) {
        door.unlocked = true;
        PS.statusText("Door unlocked! Reach it!");
    }
}

function checkDoor() {

    if (player.x === door.x && player.y === door.y && door.unlocked) {

        level++;

        if (level >= LEVELS.length) {
            PS.statusText("You beat all levels! 🎉 Press 1 to restart.");
            gameOver = true;
            level = 0;
        } else {
            loadLevel();
        }
    }
}

function moveEnemies() {

    enemies.forEach(e => {

        let dx = 0;
        let dy = 0;

        if (Math.abs(player.x - e.x) > Math.abs(player.y - e.y)) {
            dx = player.x > e.x ? 1 : -1;
        } else {
            dy = player.y > e.y ? 1 : -1;
        }

        let nx = e.x + dx;
        let ny = e.y + dy;

        if (
            nx >= 0 && nx < GRID_WIDTH &&
            ny >= 0 && ny < GRID_HEIGHT &&
            !isWall(nx, ny)
        ) {
            e.x = nx;
            e.y = ny;
        }
    });
}

function checkEnemies() {

    for (let e of enemies) {
        if (player.x === e.x && player.y === e.y) {
            PS.statusText("Caught! Press 1 to retry level.");
            gameOver = true;
            break;
        }
    }
}

/* ---------- INPUT ---------- */

PS.keyDown = function (key) {

    if (key === 49) { // key "1"
        loadLevel();
        return;
    }

    if (gameOver) return;

    let nx = player.x;
    let ny = player.y;

    if (key === PS.KEY_ARROW_UP) ny--;
    else if (key === PS.KEY_ARROW_DOWN) ny++;
    else if (key === PS.KEY_ARROW_LEFT) nx--;
    else if (key === PS.KEY_ARROW_RIGHT) nx++;
    else return;

    if (
        nx < 0 || nx >= GRID_WIDTH ||
        ny < 0 || ny >= GRID_HEIGHT ||
        isWall(nx, ny)
    ) return;

    player.x = nx;
    player.y = ny;

    checkGem();
    checkDoor();

    if (!gameOver) {
        moveEnemies();
        checkEnemies();
    }

    drawGrid();
};
