"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameMath = void 0;
class GameMath {
    static lerp(from, to, steps, delta) {
        return (from + (to - from) / (steps / delta));
    }
}
exports.GameMath = GameMath;
