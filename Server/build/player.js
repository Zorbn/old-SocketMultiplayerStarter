"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const entity_1 = require("./entity");
class Player extends entity_1.Entity {
    constructor(pos, moveSpeed, socket) {
        super(pos, moveSpeed);
        this.id = socket.id;
        this.socket = socket;
        Player.playerList[this.id] = this;
        let playerDataList = {};
        for (let [id, player] of Object.entries(Player.playerList)) {
            playerDataList[id] = player.toData();
        }
        socket.emit("init", {
            playerDataList
        });
        socket.broadcast.emit("addPlayer", {
            id: socket.id,
            entityData: {
                pos,
                moveSpeed
            }
        });
        Player.playerCount++;
    }
    static updateAll() {
        for (let [_, player] of Object.entries(Player.playerList)) {
            player.update();
        }
    }
    update() {
        this.socket.broadcast.emit("playerMoved", {
            id: this.socket.id,
            pos: this.pos
        });
    }
    delete() {
        delete Player.playerList[this.id];
        Player.playerCount--;
        this.socket.broadcast.emit("removePlayer", {
            id: this.id
        });
    }
    static registerListeners(socket) {
        socket.on("playerMoved", (event) => {
            if (!event)
                return;
            Player.playerList[event.id].pos = event.pos;
        });
    }
}
exports.Player = Player;
Player.playerList = {};
Player.playerCount = 0;
/*
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
*/ 
