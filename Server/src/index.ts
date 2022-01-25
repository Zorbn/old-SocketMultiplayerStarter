import express from "express";
const app = express();
const server = require("http").createServer(app);
import path from "path";
import { Socket } from "socket.io";
const io = require("socket.io")(server);

// TODO: Limit tick rate
// TODO: Interpolate movement (client-side)

app.use(
    express.static(path.join(__dirname, "../../Client/build"))
);

type Player = {
    x: number,
    y: number,
    moveSpeed: number
}

type PlayerMovementEvent = {
    id: string,
    x: number,
    y: number
}

let players: { [id: string]: Player } = {};
let playerCount = 0;

io.on("connection", (socket: Socket) => {
    console.log("A client connected");
    addPlayer(socket, Math.random() * 300, Math.random() * 300);

    socket.on("disconnect", () => {
        console.log("A client disconnected");
        removePlayer(socket);
    });

    socket.on("playerMoved", (event: PlayerMovementEvent) => {        
        if (!event) return;

        players[event.id].x = event.x;
        players[event.id].y = event.y;

        socket.broadcast.emit("playerMoved", {
            id: event.id,
            x: event.x,
            y: event.y
        });
    });
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log("Listening on: ", port);
});

function addPlayer(socket: Socket, x: number, y: number) {
    players[socket.id] = {
        x,
        y,
        moveSpeed: 4,
    };

    socket.emit("initPlayer", {
        id: socket.id,
        playerList: players
    });

    socket.broadcast.emit("addPlayer", {
        id: socket.id,
        x,
        y
    });

    playerCount++;
}

function removePlayer(socket: Socket) {
    delete players[socket.id];
    playerCount--;
    socket.broadcast.emit("removePlayer", {
        id: socket.id
    });
}
