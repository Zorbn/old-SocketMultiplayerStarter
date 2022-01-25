"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = __importDefault(require("socket.io-client"));
const pixi = __importStar(require("pixi.js"));
const socket = (0, socket_io_client_1.default)();
let app = new pixi.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x00a1db
});
document.body.appendChild(app.view);
let players = {};
let smoothPlayerPositions = {};
const smoothSteps = 3;
let localId = "";
let initialized = false;
function addPlayer(event) {
    if (!event)
        return;
    players[event.id] = {
        pos: event.pos,
        moveSpeed: event.moveSpeed,
        sprite: pixi.Sprite.from("./assets/player.png")
    };
    smoothPlayerPositions[event.id] = event.pos;
    app.stage.addChild(players[event.id].sprite);
}
socket.on("playerMoved", (event) => {
    if (!event)
        return;
    if (players[event.id] != null) {
        players[event.id].pos = event.pos;
    }
});
socket.on("initPlayer", (event) => {
    if (!event)
        return;
    localId = event.id;
    players = event.playerList;
    initialized = true;
    for (let [id, player] of Object.entries(players)) {
        addPlayer({
            id,
            pos: player.pos,
            moveSpeed: player.moveSpeed
        });
    }
    console.log(localId);
});
socket.on("addPlayer", (event) => {
    if (!event)
        return;
    addPlayer(event);
});
socket.on("removePlayer", (event) => {
    if (!event)
        return;
    app.stage.removeChild(players[event.id].sprite);
    delete players[event.id];
    delete smoothPlayerPositions[event.id];
});
let pressedKeys = [];
document.addEventListener("keydown", (event) => {
    if (!pressedKeys.includes(event.key))
        pressedKeys.push(event.key);
});
document.addEventListener("keyup", (event) => {
    let i = pressedKeys.findIndex((val) => { return (val === event.key); });
    if (i != -1)
        pressedKeys.splice(i, 1);
});
window.onblur = () => {
    if (pressedKeys.length > 0)
        pressedKeys = [];
};
window.addEventListener("resize", () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
});
app.ticker.add((delta) => {
    update(delta);
});
function lerp(start, end, steps, delta) {
    return (start + (end - start) / (steps / delta));
}
function vectorLerp(start, end, steps, delta) {
    return {
        x: lerp(start.x, end.x, steps, delta),
        y: lerp(start.y, end.y, steps, delta)
    };
}
function update(delta) {
    if (!initialized)
        return;
    updateLocalPlayer(delta);
    for (let [id, player] of Object.entries(players)) {
        if (id != localId) {
            smoothPlayerPositions[id] = vectorLerp(smoothPlayerPositions[id], player.pos, smoothSteps, delta);
        }
        else {
            smoothPlayerPositions[id] = player.pos;
        }
        player.sprite.x = smoothPlayerPositions[id].x;
        player.sprite.y = smoothPlayerPositions[id].y;
    }
}
;
function updateLocalPlayer(delta) {
    let localPlayer = players[localId];
    if (!localPlayer)
        return;
    let moveInputX = 0;
    let moveInputY = 0;
    if (pressedKeys.includes("w") || pressedKeys.includes("ArrowUp")) {
        moveInputY -= 1;
    }
    if (pressedKeys.includes("s") || pressedKeys.includes("ArrowDown")) {
        moveInputY += 1;
    }
    if (pressedKeys.includes("a") || pressedKeys.includes("ArrowLeft")) {
        moveInputX -= 1;
    }
    if (pressedKeys.includes("d") || pressedKeys.includes("ArrowRight")) {
        moveInputX += 1;
    }
    let moveInputMagnitude = Math.sqrt(moveInputX * moveInputX + moveInputY * moveInputY);
    if (moveInputMagnitude != 0) {
        moveInputX /= moveInputMagnitude;
        moveInputY /= moveInputMagnitude;
    }
    let deltaSpeed = localPlayer.moveSpeed * delta;
    localPlayer.pos.x += moveInputX * deltaSpeed;
    localPlayer.pos.y += moveInputY * deltaSpeed;
    socket.emit("playerMoved", {
        id: localId,
        pos: localPlayer.pos
    });
}
