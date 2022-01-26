import * as Pixi from "pixi.js";
import { Socket } from "socket.io-client";
import { EntityData } from "./entity";
import { Player } from "./player";

type InitEvent = {
    playerDataList: { [id: string]: EntityData }
}

export class GameApp extends Pixi.Application {
    private initialized = false;

    constructor(backgroundColor: number, socket: Socket) {
        super({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor
        });
        document.body.appendChild(this.view);

        this.ticker.add((delta) => {
            this.update(socket, delta)
        });
    }

    private update(socket: Socket, delta: number) {
        if (!this.initialized) return;
    
        Player.updateLocalPlayer(socket, delta);
        Player.updateAll(socket.id, delta);
    };

    public registerListeners(socket: Socket) {
        window.addEventListener("resize", () => {
            this.renderer.resize(window.innerWidth, window.innerHeight);
        });

        socket.on("init", (event: InitEvent) => {
            if (!event) return;
        
            for (let [id, player] of Object.entries(event.playerDataList)) {
                new Player(player.pos, player.moveSpeed, this.stage, id);
            }
        
            this.initialized = true;
        });
    }
}