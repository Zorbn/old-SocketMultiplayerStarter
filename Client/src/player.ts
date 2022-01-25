import * as Pixi from "pixi.js";
import { Socket } from "socket.io-client";
import { Entity, EntityData } from "./entity";
import { Input } from "./input";
import { Vector } from "./vector";

// TODO: Evaluate if removing individual player Id's works better

export type PlayerList = { [id: string]: Player };

type PlayerData = {
    id: string,
    entityData: EntityData
}

type PlayerMovementEvent = {
    id: string,
    pos: Vector,
}

type RemovePlayerEvent = {
    id: string
}

export class Player extends Entity {
    private id: string;
    private stage: Pixi.Container;
    public static playerList: PlayerList = {};

    constructor(pos: Vector, moveSpeed: number, stage: Pixi.Container, id: string) {
        super(pos, moveSpeed, stage);
        this.id = id;
        this.stage = stage;
        Player.playerList[this.id] = this;
    }

    public static updateLocalPlayer(socket: Socket, delta: number) {
        let localPlayer = Player.playerList[socket.id];
        if (!localPlayer) return;
        localPlayer.updateLocal(socket, delta);
    }

    public updateLocal(socket: Socket, delta: number) {
        let moveInputX = 0;
        let moveInputY = 0;
    
        if (Input.isKeyPressed("w") || Input.isKeyPressed("ArrowUp"))    moveInputY -= 1;
        if (Input.isKeyPressed("s") || Input.isKeyPressed("ArrowDown"))  moveInputY += 1;
        if (Input.isKeyPressed("a") || Input.isKeyPressed("ArrowLeft"))  moveInputX -= 1;
        if (Input.isKeyPressed("d") || Input.isKeyPressed("ArrowRight")) moveInputX += 1;
    
        let moveInputMagnitude = Math.sqrt(moveInputX * moveInputX + moveInputY * moveInputY);
        
        if (moveInputMagnitude != 0) {
            moveInputX /= moveInputMagnitude;
            moveInputY /= moveInputMagnitude;
        }
    
        let deltaSpeed = this.moveSpeed * delta;
        this.pos.x += moveInputX * deltaSpeed;
        this.pos.y += moveInputY * deltaSpeed;
    
        socket.emit("playerMoved", {
            id: this.id,
            pos: this.pos
        });
    }

    public static updateAll(localId: string, delta: number) {
        for (let [_, player] of Object.entries(Player.playerList)) {
            player.update(localId, delta);
        }
    }

    public update(localId: string, delta: number) {
        if (this.id != localId) {
            this.smoothPos = Vector.lerp(this.smoothPos, this.pos, Player.smoothSteps, delta);
        } else {
            this.smoothPos = this.pos;
        }

        this.sprite.x = this.smoothPos.x;
        this.sprite.y = this.smoothPos.y;
    }

    public delete() {
        this.stage.removeChild(Player.playerList[this.id].sprite);
        delete Player.playerList[this.id];
    }

    public static registerListeners(socket: Socket, stage: Pixi.Container) {
        socket.on("playerMoved", (event: PlayerMovementEvent) => {
            if (!event) return;
        
            if (Player.playerList[event.id] != null) {
                Player.playerList[event.id].pos = event.pos;
            }
        });
        
        socket.on("addPlayer", (event: PlayerData) => {
            if (!event) return;
        
            new Player(event.entityData.pos, event.entityData.moveSpeed, stage, event.id);
        });
        
        socket.on("removePlayer", (event: RemovePlayerEvent) => {
            if (!event) return;
            
            Player.playerList[event.id].delete();
        });
    }
}