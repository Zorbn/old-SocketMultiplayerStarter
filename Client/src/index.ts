import io from "socket.io-client";
import { Player } from "./player";
import { Input } from "./input";
import { GameApp } from "./gameApp";

const socket = io();

let gameApp = new GameApp(0x00a1db, socket);
gameApp.registerListeners(socket);

Input.registerListeners();
Player.registerListeners(socket, gameApp.stage);