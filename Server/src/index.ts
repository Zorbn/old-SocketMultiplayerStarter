import express from "express";
const app = express();
const server = require("http").createServer(app);
import path from "path";
import { Socket } from "socket.io";
const io = require("socket.io")(server);

app.use(
    express.static(path.join(__dirname, "../../Client/build"))
);

type Vector = {
    x: number,
    y: number
}

type EntityData = {
    pos: Vector,
    moveSpeed: number
}

type PlayerList = { [id: string]: EntityData };

type PlayerMovementEvent = {
    id: string,
    pos: Vector
}

let playerList: PlayerList = {};
let playerCount = 0;

io.on("connection", (socket: Socket) => {
    console.log("A client connected");
    addPlayer(socket, { x: Math.random() * 300, y: Math.random() * 300 });

    socket.on("disconnect", () => {
        console.log("A client disconnected");
        removePlayer(socket);
    });

    socket.on("playerMoved", (event: PlayerMovementEvent) => {        
        if (!event) return;

        playerList[event.id].pos = event.pos;
    });
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log("Listening on: ", port);
});

function addPlayer(socket: Socket, pos: Vector) {
    let playerMoveSpeed = 4;

    playerList[socket.id] = {
        pos,
        moveSpeed: playerMoveSpeed,
    };

    socket.emit("init", {
        playerList: playerList
    });

    socket.broadcast.emit("addPlayer", {
        id: socket.id,
        entityData: {
            pos,
            moveSpeed: playerMoveSpeed
        }
    });

    playerCount++;
}

function removePlayer(socket: Socket) {
    delete playerList[socket.id];
    playerCount--;
    socket.broadcast.emit("removePlayer", {
        id: socket.id
    });
}

const TickRate = 30;
const TickMs = 1000 / TickRate;

function tick() {
    for (let [id, player] of Object.entries(playerList)) {
        io.sockets.sockets.get(id).broadcast.emit("playerMoved", {
            id,
            pos: player.pos
        });
    }
}

setInterval(tick, TickMs);
