import * as Pixi from "pixi.js";
import { Vector } from "./vector";

export type EntityData = {
    pos: Vector,
    moveSpeed: number
}

export class Entity {
    protected pos: Vector;
    protected smoothPos: Vector;
    protected moveSpeed: number;
    protected sprite: Pixi.Sprite;

    public static smoothSteps = 3;
    public static entityList: Entity[] = [];

    constructor(pos: Vector, moveSpeed: number, stage: Pixi.Container) {
        this.pos = pos;
        this.smoothPos = pos;
        this.moveSpeed = moveSpeed;
        this.sprite = Pixi.Sprite.from("./assets/player.png");
        Entity.entityList.push(this);
        
        stage.addChild(this.sprite);
    }
}