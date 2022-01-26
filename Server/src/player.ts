import { Socket } from "socket.io";
import { Entity, EntityData } from "./entity";
import { Vector } from "./vector";

type PlayerList = { [id: string]: Player };

type PlayerMovementEvent = {
    id: string,
    pos: Vector
}

export class Player extends Entity {
    private id: string;
    private socket: Socket;
    public static playerList: PlayerList = {};
    public static playerCount = 0;

    constructor(pos: Vector, moveSpeed: number, socket: Socket) {
        super(pos, moveSpeed);
        this.id = socket.id;
        this.socket = socket;
        Player.playerList[this.id] = this;

        let playerDataList: { [id: string]: EntityData } = {};
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

    public static updateAll() {
        for (let [_, player] of Object.entries(Player.playerList)) {
            player.update();
        }
    }

    public update() {
        this.socket.broadcast.emit("playerMoved", {
            id: this.socket.id,
            pos: this.pos
        });
    }

    public delete() {
        delete Player.playerList[this.id];
        Player.playerCount--;

        this.socket.broadcast.emit("removePlayer", {
            id: this.id
        });
    }

    public static registerListeners(socket: Socket) {
        socket.on("playerMoved", (event: PlayerMovementEvent) => {        
            if (!event) return;
    
            Player.playerList[event.id].pos = event.pos;
        });
    }
}

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