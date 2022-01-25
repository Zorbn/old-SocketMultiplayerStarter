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
// TODO: Share types??
// TODO: Use classes (ie: vector class, entity class (reusable smooth movement), etc)
app.use(express_1.default.static(path_1.default.join(__dirname, "../../Client/build")));
let playerList = {};
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
        playerList[event.id].pos = event.pos;
    });
});
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log("Listening on: ", port);
});
function addPlayer(socket, pos) {
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
function removePlayer(socket) {
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
