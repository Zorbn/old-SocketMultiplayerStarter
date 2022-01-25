import io from "socket.io-client";
import * as pixi from "pixi.js"
const socket = io();

let app = new pixi.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x00a1db
});
document.body.appendChild(app.view);

type PlayerList = { [id: string]: Player };

type Player = {
    x: number,
    y: number,
    moveSpeed: number,
    sprite: pixi.Sprite
}

type PlayerMovementEvent = {
    id: string,
    x: number,
    y: number
}

type InitPlayerEvent = {
    id: string,
    playerList: PlayerList
}

type AddPlayerEvent = {
    id: string,
    x: number,
    y: number,
    moveSpeed: number
}

type RemovePlayerEvent = {
    id: string
}

let players: PlayerList = {};
let localId = "";
let initialized = false;

function addPlayer(event: AddPlayerEvent) {
    if (!event) return;
    
    players[event.id] = {
        x: event.x,
        y: event.y,
        moveSpeed: event.moveSpeed,
        sprite: pixi.Sprite.from("./assets/player.png")
    };

    app.stage.addChild(players[event.id].sprite);
}

socket.on("playerMoved", (event: PlayerMovementEvent) => {
    if (!event) return;

    if (players[event.id] != null) {
        players[event.id].x = event.x;
        players[event.id].y = event.y;
    }
});

socket.on("initPlayer", (event: InitPlayerEvent) => {
    if (!event) return;

    localId = event.id;
    players = event.playerList;
    initialized = true;

    for (let [id, player] of Object.entries(players)) {
        addPlayer({
            id,
            x: player.x,
            y: player.y,
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
    
    app.stage.removeChild(players[event.id].sprite);
    delete players[event.id];
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

function update(delta: number) {
    if (!initialized) return;

    updateLocalPlayer(delta);

    for (let [id, player] of Object.entries(players)) {
        player.sprite.x = player.x;
        player.sprite.y = player.y;
    }
};

function updateLocalPlayer(delta: number) {    
    let localPlayer = players[localId];

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
    localPlayer.x += moveInputX * deltaSpeed;
    localPlayer.y += moveInputY * deltaSpeed;

    socket.emit("playerMoved", {
        id: localId,
        x: localPlayer.x,
        y: localPlayer.y
    });
}