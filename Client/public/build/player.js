"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const entity_1 = require("./entity");
const input_1 = require("./input");
const vector_1 = require("./vector");
class Player extends entity_1.Entity {
    constructor(pos, moveSpeed, stage, id) {
        super(pos, moveSpeed, stage);
        this.id = id;
        this.stage = stage;
        Player.playerList[this.id] = this;
    }
    static updateLocalPlayer(socket, delta) {
        let localPlayer = Player.playerList[socket.id];
        if (!localPlayer)
            return;
        localPlayer.updateLocal(socket, delta);
    }
    updateLocal(socket, delta) {
        let moveInputX = 0;
        let moveInputY = 0;
        if (input_1.Input.isKeyPressed("w") || input_1.Input.isKeyPressed("ArrowUp"))
            moveInputY -= 1;
        if (input_1.Input.isKeyPressed("s") || input_1.Input.isKeyPressed("ArrowDown"))
            moveInputY += 1;
        if (input_1.Input.isKeyPressed("a") || input_1.Input.isKeyPressed("ArrowLeft"))
            moveInputX -= 1;
        if (input_1.Input.isKeyPressed("d") || input_1.Input.isKeyPressed("ArrowRight"))
            moveInputX += 1;
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
    static updateAll(localId, delta) {
        for (let [_, player] of Object.entries(Player.playerList)) {
            player.update(localId, delta);
        }
    }
    update(localId, delta) {
        if (this.id != localId) {
            this.smoothPos = vector_1.Vector.lerp(this.smoothPos, this.pos, Player.smoothSteps, delta);
        }
        else {
            this.smoothPos = this.pos;
        }
        this.sprite.x = this.smoothPos.x;
        this.sprite.y = this.smoothPos.y;
    }
    delete() {
        this.stage.removeChild(Player.playerList[this.id].sprite);
        delete Player.playerList[this.id];
    }
    static registerListeners(socket, stage) {
        socket.on("playerMoved", (event) => {
            if (!event)
                return;
            if (Player.playerList[event.id] != null) {
                Player.playerList[event.id].pos = event.pos;
            }
        });
        socket.on("addPlayer", (event) => {
            if (!event)
                return;
            new Player(event.entityData.pos, event.entityData.moveSpeed, stage, event.id);
        });
        socket.on("removePlayer", (event) => {
            if (!event)
                return;
            Player.playerList[event.id].delete();
        });
    }
}
exports.Player = Player;
Player.playerList = {};
