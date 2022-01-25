"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = __importDefault(require("socket.io-client"));
const player_1 = require("./player");
const input_1 = require("./input");
const gameApp_1 = require("./gameApp");
const socket = (0, socket_io_client_1.default)();
let gameApp = new gameApp_1.GameApp(window.innerWidth, window.innerHeight, 0x00a1db, socket);
gameApp.registerListeners(socket);
input_1.Input.registerListeners();
player_1.Player.registerListeners(socket, gameApp.stage);
