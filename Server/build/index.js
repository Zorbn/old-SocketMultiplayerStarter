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
// TODO: Share types
// TODO: Use classes (ie: vector class, entity class (reusable smooth movement), etc)
app.use(express_1.default.static(path_1.default.join(__dirname, "../../Client/build")));
let players = {};
let playerCount = 0;
io.on("connection", (socket) => {
    console.log("A client connected");
    addPlayer(socket, { x: Math.random() * 300, y: Math.random() * 300 });
    socket.on("disconnect", () => {
        console.log("A client disconnected");
        removePlayer(socket);
    });
    socket.on("playerMoved", (event) => {
        if (!event)
            return;
        players[event.id].pos = event.pos;
    });
});
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log("Listening on: ", port);
});
function addPlayer(socket, pos) {
    players[socket.id] = {
        pos,
        moveSpeed: 4,
    };
    socket.emit("initPlayer", {
        id: socket.id,
        playerList: players
    });
    socket.broadcast.emit("addPlayer", {
        id: socket.id,
        pos
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
const TickRate = 30;
const TickMs = 1000 / TickRate;
function tick() {
    for (let [id, player] of Object.entries(players)) {
        io.sockets.sockets.get(id).broadcast.emit("playerMoved", {
            id,
            pos: player.pos
        });
    }
}
setInterval(tick, TickMs);
