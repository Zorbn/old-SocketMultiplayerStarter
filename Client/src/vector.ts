import { GameMath } from "./gameMath";

export class Vector {
    public x = 0;
    public y = 0;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public static lerp(from: Vector, to: Vector, steps: number, delta: number): Vector {
        let x = GameMath.lerp(from.x, to.x, steps, delta);
        let y = GameMath.lerp(from.y, to.y, steps, delta);

        return new Vector(x, y);
    }
}