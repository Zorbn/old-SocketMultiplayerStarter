import io from "socket.io-client";
import * as pixi from "pixi.js"
const socket = io();

let app = new pixi.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x00a1db
});
document.body.appendChild(app.view);

type Vector = {
    x: number,
    y: number
}

type PlayerList = { [id: string]: Player };

type Player = {
    pos: Vector,
    moveSpeed: number,
    sprite: pixi.Sprite
}

type PlayerMovementEvent = {
    id: string,
    pos: Vector,
}

type InitPlayerEvent = {
    id: string,
    playerList: PlayerList
}

type AddPlayerEvent = {
    id: string,
    pos: Vector,
    moveSpeed: number
}

type RemovePlayerEvent = {
    id: string
}

let playerList: PlayerList = {};
let smoothPosList: { [id: string]: Vector } = {};
const smoothSteps = 3;
let localId = "";
let initialized = false;

function addPlayer(event: AddPlayerEvent) {
    if (!event) return;
    
    playerList[event.id] = {
        pos: event.pos,
        moveSpeed: event.moveSpeed,
        sprite: pixi.Sprite.from("./assets/player.png")
    };

    smoothPosList[event.id] = event.pos;

    app.stage.addChild(playerList[event.id].sprite);
}

socket.on("playerMoved", (event: PlayerMovementEvent) => {
    if (!event) return;

    if (playerList[event.id] != null) {
        playerList[event.id].pos = event.pos;
    }
});

socket.on("initPlayer", (event: InitPlayerEvent) => {
    if (!event) return;

    localId = event.id;
    playerList = event.playerList;
    initialized = true;

    for (let [id, player] of Object.entries(playerList)) {
        addPlayer({
            id,
            pos: player.pos,
            moveSpeed: player.moveSpeed
        });
    }

    console.log(localId);
});

socket.on("addPlayer", (event: AddPlayerEvent) => {
    if (!event) return;

    addPlayer(event);
});

socket.on("removePlayer", (event: RemovePlayerEvent) => {
    if (!event) return;
    
    app.stage.removeChild(playerList[event.id].sprite);
    delete playerList[event.id];
    delete smoothPosList[event.id];
});

let pressedKeys: string[] = [];

document.addEventListener("keydown", (event) => {
    if (!pressedKeys.includes(event.key)) pressedKeys.push(event.key);
});

document.addEventListener("keyup", (event) => {
    let i = pressedKeys.findIndex((val) => { return (val === event.key) });
    if (i != -1) pressedKeys.splice(i, 1);
});

window.onblur = () => {
    if (pressedKeys.length > 0) pressedKeys = [];
};

window.addEventListener("resize", () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
});

app.ticker.add((delta) => {
    update(delta)
});

function lerp(start: number, end: number, steps: number, delta: number): number {
    return (start + (end - start) / (steps / delta));
}

function vectorLerp(start: Vector, end: Vector, steps: number, delta: number): Vector {
    return {
        x: lerp(start.x, end.x, steps, delta),
        y: lerp(start.y, end.y, steps, delta)
    }
}

function update(delta: number) {
    if (!initialized) return;

    updateLocalPlayer(delta);

    for (let [id, player] of Object.entries(playerList)) {        
        if (id != localId) {
            smoothPosList[id] = vectorLerp(smoothPosList[id], player.pos, smoothSteps, delta);
        } else {
            smoothPosList[id] = player.pos;
        }

        player.sprite.x = smoothPosList[id].x;
        player.sprite.y = smoothPosList[id].y;
    }
};

function updateLocalPlayer(delta: number) {    
    let localPlayer = playerList[localId];

    if (!localPlayer) return;

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