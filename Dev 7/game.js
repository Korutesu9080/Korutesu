/* jshint browser: true, devel: true, esversion: 6 */
/* globals PS */
"use strict";

/*
FIREWALL — Fully Fixed Version with Shield Safe
*/

// ================= CONSTANTS =================
const GRID_W = 15;
const GRID_H = 15;
const PLAYER_Y = GRID_H - 1;
const MAX_HEALTH = 5;

const COLOR_BG = PS.COLOR_GRAY_DARK;
const COLOR_PLAYER = PS.COLOR_CYAN;
const COLOR_VIRUS = PS.COLOR_RED;
const COLOR_PROJECTILE = PS.COLOR_YELLOW;
const COLOR_SHIELD = PS.COLOR_GREEN;
const COLOR_BOSS = PS.COLOR_MAGENTA;

// ================= STATE =================
let playerX;
let viruses;
let projectiles;
let powerUps;

let health;
let score;
let shield;

let timerID = null;
let flashTimer = null;

let started = false;
let gameOver = false;

let tickCounter;
let difficulty;
let shootCooldown;
let bossActive;

// ================= INIT =================
PS.init = function () {
    PS.gridSize(GRID_W, GRID_H);
    PS.border(PS.ALL, PS.ALL, 0);
    PS.seed(12345);
    showTitle();
};

// ================= TITLE =================
function showTitle() {
    stopAllTimers();

    started = false;
    gameOver = false;

    PS.color(PS.ALL, PS.ALL, PS.COLOR_BLACK);
    PS.glyph(PS.ALL, PS.ALL, "");

    PS.glyph(5, 6, "F");
    PS.glyph(6, 6, "I");
    PS.glyph(7, 6, "R");
    PS.glyph(8, 6, "E");
    PS.glyph(9, 6, "W");
    PS.glyph(10, 6, "A");
    PS.glyph(11, 6, "L");
    PS.glyph(12, 6, "L");

    PS.statusText("Protect the system. Click to begin.");
}

// ================= START GAME =================
function startGame() {
    stopAllTimers();

    started = true;
    gameOver = false;

    playerX = Math.floor(GRID_W / 2);
    viruses = [];
    projectiles = [];
    powerUps = [];

    health = MAX_HEALTH;
    score = 0;
    shield = false;
    bossActive = false;

    tickCounter = 0;
    difficulty = 3;
    shootCooldown = 0;

    PS.color(PS.ALL, PS.ALL, COLOR_BG);
    PS.glyph(PS.ALL, PS.ALL, "");

    timerID = PS.timerStart(12, gameTick);

    updateStatus();
    draw();
}

// ================= GAME LOOP =================
function gameTick() {
    if (gameOver) return;

    tickCounter++;
    if (shootCooldown > 0) shootCooldown--;

    // Difficulty ramp
    if (tickCounter % 300 === 0 && difficulty > 1) {
        difficulty--;
    }

    // Check collisions BEFORE moving projectiles
    handleCollisions();

    // Move projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
        projectiles[i].y--;
        if (projectiles[i].y < 0) {
            projectiles.splice(i, 1);
        }
    }

    // Move viruses
    if (tickCounter % difficulty === 0) {
        for (let i = viruses.length - 1; i >= 0; i--) {
            viruses[i].y++;

            if (viruses[i].y >= GRID_H) {
                viruses.splice(i, 1);

                if (!shield) {
                    health--;
                    flashDamage();
                } else {
                    shield = false;
                }

                if (health <= 0) {
                    endGame();
                    return;
                }
            }
        }

        spawnVirus();
        spawnPowerUp();
        spawnBoss();
    }

    updateStatus();
    draw();
}

// ================= SPAWN FUNCTIONS =================
function spawnVirus() {
    if (PS.random(100) < 30) {
        viruses.push({ x: PS.random(GRID_W) - 1, y: 0, hp: 1 });
    }
}

function spawnPowerUp() {
    if (PS.random(100) < 3) {
        powerUps.push({ x: PS.random(GRID_W) - 1, y: 0 });
    }
}

function spawnBoss() {
    if (!bossActive && score >= 15) {
        bossActive = true;
        viruses.push({ x: Math.floor(GRID_W / 2), y: 0, hp: 5, boss: true });
    }
}

// ================= COLLISIONS =================
function handleCollisions() {
    // Projectile hits virus
    for (let p = projectiles.length - 1; p >= 0; p--) {
        let proj = projectiles[p];
        for (let v = viruses.length - 1; v >= 0; v--) {
            let virus = viruses[v];

            if (proj.x === virus.x && proj.y === virus.y) {
                virus.hp--;
                if (virus.hp <= 0) {
                    if (virus.boss) bossActive = false;
                    viruses.splice(v, 1);
                    score++;
                }
                projectiles.splice(p, 1);
                PS.audioPlay("fx_coin1");
                break;
            }
        }
    }

    // Power-up collection
    for (let i = powerUps.length - 1; i >= 0; i--) {
        let pu = powerUps[i];
        pu.y++;
        if (pu.y === PLAYER_Y && pu.x === playerX) {
            shield = true;

            // Use safe default sound
            PS.audioPlay("fx_coin1");

            powerUps.splice(i, 1);
        } else if (pu.y >= GRID_H) {
            powerUps.splice(i, 1);
        }
    }
}

// ================= DAMAGE FLASH =================
function flashDamage() {
    // Only one flash at a time
    if (flashTimer) return;

    PS.color(PS.ALL, PS.ALL, PS.COLOR_RED);

    flashTimer = PS.timerStart(5, function () {
        PS.color(PS.ALL, PS.ALL, COLOR_BG);
        PS.timerStop(flashTimer);
        flashTimer = null;
    });
}

// ================= DRAW =================
function draw() {
    PS.color(PS.ALL, PS.ALL, COLOR_BG);

    viruses.forEach(v =>
        PS.color(v.x, v.y, v.boss ? COLOR_BOSS : COLOR_VIRUS)
    );

    projectiles.forEach(p =>
        PS.color(p.x, p.y, COLOR_PROJECTILE)
    );

    powerUps.forEach(pu =>
        PS.color(pu.x, pu.y, COLOR_SHIELD)
    );

    PS.color(playerX, PLAYER_Y, shield ? COLOR_SHIELD : COLOR_PLAYER);
}

// ================= INPUT =================
PS.touch = function () {
    if (!started) startGame();
};

PS.keyDown = function (key) {
    if (key === 49) { // Reset with '1'
        startGame();
        return;
    }

    if (!started || gameOver) return;

    if (key === PS.KEY_ARROW_LEFT && playerX > 0) playerX--;
    else if (key === PS.KEY_ARROW_RIGHT && playerX < GRID_W - 1) playerX++;
    else if (key === PS.KEY_SPACE && shootCooldown === 0) {
        projectiles.push({ x: playerX, y: PLAYER_Y - 1 });
        shootCooldown = 2; // Faster shooting
        PS.audioPlay("fx_click");
    }

    draw();
};

// ================= STATUS =================
function updateStatus() {
    PS.statusText("Health: " + health +
        "  Score: " + score +
        (shield ? "  SHIELD" : ""));
}

// ================= GAME OVER =================
function endGame() {
    stopAllTimers();
    gameOver = true;

    PS.color(PS.ALL, PS.ALL, PS.COLOR_BLACK);
    PS.statusText("SYSTEM FAILURE — Press 1 to restart");

    PS.audioPlay("fx_hoot");
}

// ================= TIMER CLEANUP =================
function stopAllTimers() {
    if (timerID) {
        PS.timerStop(timerID);
        timerID = null;
    }
    if (flashTimer) {
        PS.timerStop(flashTimer);
        flashTimer = null;
    }
}
