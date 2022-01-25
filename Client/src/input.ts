export abstract class Input {
    private static pressedKeys: string[] = [];

    public static registerListeners() {
        document.addEventListener("keydown", (event) => {
            if (!this.pressedKeys.includes(event.key)) this.pressedKeys.push(event.key);
        });
        
        document.addEventListener("keyup", (event) => {
            let i = this.pressedKeys.findIndex((val) => { return (val === event.key) });
            if (i != -1) this.pressedKeys.splice(i, 1);
        });
        
        window.addEventListener("blur", () => {
            if (this.pressedKeys.length > 0) this.pressedKeys = [];
        });
    }

    public static isKeyPressed(key: string): boolean {
        return this.pressedKeys.includes(key);
    }
}