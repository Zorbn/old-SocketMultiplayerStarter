"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gameServer_1 = require("./gameServer");
let gameServer = new gameServer_1.GameServer(30);
gameServer.registerListeners();
