"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entity = void 0;
class Entity {
    constructor(pos, moveSpeed) {
        this.pos = pos;
        this.moveSpeed = moveSpeed;
    }
    toData() {
        return {
            pos: this.pos,
            moveSpeed: this.moveSpeed
        };
    }
}
exports.Entity = Entity;
