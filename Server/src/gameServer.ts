import { Socket } from "socket.io";
import { Player } from "./player";
import express from "express";
import path from "path";

export class GameServer {
    private readonly tickMs: number;

    private readonly app: any;
    private readonly server: any;
    private readonly io: any;

    constructor(tickRate: number, port = process.env.PORT || 3000) {
        this.tickMs = 1000 / tickRate;

        this.app = express();
        this.server = require("http").createServer(this.app);
        this.io = require("socket.io")(this.server);

        this.app.use(
            express.static(path.join(__dirname, "../../Client/build"))
        );

        this.server.listen(port, () => {
            console.log("Listening on: ", port);
        });

        setInterval(this.tick, this.tickMs);
    }

    public registerListeners() {
        this.io.on("connection", (socket: Socket) => {
            console.log("A client connected");
            new Player({ x: Math.random() * 300, y: Math.random() * 300 }, 4, socket);
        
            socket.on("disconnect", () => {
                console.log("A client disconnected");
                Player.playerList[socket.id].delete();
            });
        
            Player.registerListeners(socket);
        });
    }

    private tick() {
        Player.updateAll();
    }
}