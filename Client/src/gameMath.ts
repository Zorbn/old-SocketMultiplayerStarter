export abstract class GameMath {
    public static lerp(from: number, to: number, steps: number, delta: number): number {
        return (from + (to - from) / (steps / delta));
    }
}