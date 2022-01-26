import { Vector } from "./vector";

export type EntityData = {
    pos: Vector,
    moveSpeed: number
}

export class Entity {
    protected pos: Vector;
    protected moveSpeed: number;

    constructor(pos: Vector, moveSpeed: number) {
        this.pos = pos;
        this.moveSpeed = moveSpeed;
    }

    public toData(): EntityData {
        return {
            pos: this.pos,
            moveSpeed: this.moveSpeed
        }
    }
}