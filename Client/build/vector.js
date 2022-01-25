"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vector = void 0;
const gameMath_1 = require("./gameMath");
class Vector {
    constructor(x, y) {
        this.x = 0;
        this.y = 0;
        this.x = x;
        this.y = y;
    }
    static lerp(from, to, steps, delta) {
        let x = gameMath_1.GameMath.lerp(from.x, to.x, steps, delta);
        let y = gameMath_1.GameMath.lerp(from.y, to.y, steps, delta);
        return new Vector(x, y);
    }
}
exports.Vector = Vector;
