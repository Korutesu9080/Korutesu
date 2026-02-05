/* jshint browser : true, devel : true, esversion : 6, freeze : true */
/* globals PS : true */
"use strict";

// Grid size
const GRID_WIDTH = 8;
const GRID_HEIGHT = 8;

// Game state
let player = { x: 0, y: 0 };
let gems = [
    { x: 2, y: 1, collected: false },
    { x: 5, y: 2, collected: false },
    { x: 4, y: 6, collected: false }
];
let door = { x: 7, y: 7, unlocked: false };

// Colors
const PLAYER_COLOR = PS.COLOR_CYAN;
const GEM_COLOR = PS.COLOR_YELLOW;
const DOOR_COLOR_LOCKED = PS.COLOR_RED;
const DOOR_COLOR_UNLOCKED = PS.COLOR_GREEN;
const EMPTY_COLOR = PS.COLOR_GRAY;

// Initialize the game
PS.init = function (system, options) {
    PS.gridSize(GRID_WIDTH, GRID_HEIGHT);
    PS.border(PS.ALL, PS.ALL, 0);

    PS.statusText("Collect all gems to unlock the door!");
    drawGrid();
};

// Draw all game objects
function drawGrid() {
    // Clear grid
    PS.color(PS.ALL, PS.ALL, EMPTY_COLOR);

    // Draw gems
    gems.forEach(gem => {
        if (!gem.collected) {
            PS.color(gem.x, gem.y, GEM_COLOR);
        }
    });

    // Draw door
    PS.color(door.x, door.y, door.unlocked ? DOOR_COLOR_UNLOCKED : DOOR_COLOR_LOCKED);

    // Draw player
    PS.color(player.x, player.y, PLAYER_COLOR);
}

// Check if player collects a gem
function checkGem() {
    gems.forEach(gem => {
        if (!gem.collected && gem.x === player.x && gem.y === player.y) {
            gem.collected = true;
            PS.audioPlay("fx_coin1"); // Optional sound effect
            PS.statusText(`Gem collected! ${gems.filter(g => !g.collected).length} remaining.`);
        }
    });

    // Unlock door if all gems collected
    if (gems.every(g => g.collected)) {
        door.unlocked = true;
        PS.statusText("All gems collected! Door is unlocked!");
    }
}

// Check if player reached the door
function checkDoor() {
    if (player.x === door.x && player.y === door.y) {
        if (door.unlocked) {
            PS.statusText("You win! 🎉");
            PS.audioPlay("fx_powerup2"); // Optional sound
        } else {
            PS.statusText("The door is locked! Collect all gems first.");
        }
    }
}

// Move player using arrow keys
PS.keyDown = function (key, shift, ctrl, options) {
    switch (key) {
        case PS.KEY_ARROW_UP:
            if (player.y > 0) player.y--;
            break;
        case PS.KEY_ARROW_DOWN:
            if (player.y < GRID_HEIGHT - 1) player.y++;
            break;
        case PS.KEY_ARROW_LEFT:
            if (player.x > 0) player.x--;
            break;
        case PS.KEY_ARROW_RIGHT:
            if (player.x < GRID_WIDTH - 1) player.x++;
            break;
        default:
            return; // Ignore other keys
    }

    checkGem();
    checkDoor();
    drawGrid();
};
