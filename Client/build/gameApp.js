"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameApp = void 0;
const Pixi = __importStar(require("pixi.js"));
const player_1 = require("./player");
class GameApp extends Pixi.Application {
    constructor(width, height, backgroundColor, socket) {
        super({ width, height, backgroundColor });
        this.initialized = false;
        document.body.appendChild(this.view);
        this.ticker.add((delta) => {
            this.update(socket, delta);
        });
    }
    update(socket, delta) {
        if (!this.initialized)
            return;
        player_1.Player.updateLocalPlayer(socket, delta);
        player_1.Player.updateAll(socket.id, delta);
    }
    ;
    registerListeners(socket) {
        window.addEventListener("resize", () => {
            this.renderer.resize(window.innerWidth, window.innerHeight);
        });
        socket.on("init", (event) => {
            if (!event)
                return;
            for (let [id, player] of Object.entries(event.playerList)) {
                new player_1.Player(player.pos, player.moveSpeed, this.stage, id);
            }
            this.initialized = true;
        });
    }
}
exports.GameApp = GameApp;
