"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Input = void 0;
class Input {
    static registerListeners() {
        document.addEventListener("keydown", (event) => {
            if (!this.pressedKeys.includes(event.key))
                this.pressedKeys.push(event.key);
        });
        document.addEventListener("keyup", (event) => {
            let i = this.pressedKeys.findIndex((val) => { return (val === event.key); });
            if (i != -1)
                this.pressedKeys.splice(i, 1);
        });
        window.addEventListener("blur", () => {
            if (this.pressedKeys.length > 0)
                this.pressedKeys = [];
        });
    }
    static isKeyPressed(key) {
        return this.pressedKeys.includes(key);
    }
}
exports.Input = Input;
Input.pressedKeys = [];
