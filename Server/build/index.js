"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const server = require("http").createServer(app);
const path_1 = __importDefault(require("path"));
const io = require("socket.io")(server);
// TODO: Limit tick rate
// TODO: Handle disconnections
app.use(express_1.default.static(path_1.default.join(__dirname, "../../Client/build")));
let players = {};
let playerCount = 0;
io.on("connection", (socket) => {
    console.log("A client connected");
    addPlayer(socket, Math.random() * 300, Math.random() * 300);
    socket.on("disconnect", () => {
        console.log("A client disconnected");
        removePlayer(socket);
    });
    socket.on("playerMoved", (event) => {
        if (!event)
            return;
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
function addPlayer(socket, x, y) {
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
function removePlayer(socket) {
    delete players[socket.id];
    playerCount--;
    socket.broadcast.emit("removePlayer", {
        id: socket.id
    });
}
