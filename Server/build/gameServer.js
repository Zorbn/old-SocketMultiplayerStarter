"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameServer = void 0;
const player_1 = require("./player");
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
class GameServer {
    constructor(tickRate, port = process.env.PORT || 3000) {
        this.tickMs = 1000 / tickRate;
        this.app = (0, express_1.default)();
        this.server = require("http").createServer(this.app);
        this.io = require("socket.io")(this.server);
        this.app.use(express_1.default.static(path_1.default.join(__dirname, "../../Client/public")));
        this.server.listen(port, () => {
            console.log("Listening on: ", port);
        });
        setInterval(this.tick, this.tickMs);
    }
    registerListeners() {
        this.io.on("connection", (socket) => {
            console.log("A client connected");
            new player_1.Player({ x: Math.random() * 300, y: Math.random() * 300 }, 4, socket);
            socket.on("disconnect", () => {
                console.log("A client disconnected");
                player_1.Player.playerList[socket.id].delete();
            });
            player_1.Player.registerListeners(socket);
        });
    }
    tick() {
        player_1.Player.updateAll();
    }
}
exports.GameServer = GameServer;
