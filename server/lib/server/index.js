"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const colyseus_1 = require("colyseus");
const monitor_1 = require("@colyseus/monitor");
const Rooms_1 = require("../types/Rooms");
// import socialRoutes from "@colyseus/social/express"
const SkyOffice_1 = require("./rooms/SkyOffice");
const port = Number(process.env.PORT || 2567);
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// app.use(express.static('dist'))
const server = http_1.default.createServer(app);
const gameServer = new colyseus_1.Server({
    server,
});
// register room handlers
gameServer.define(Rooms_1.RoomType.LOBBY, colyseus_1.LobbyRoom);
gameServer.define(Rooms_1.RoomType.PUBLIC, SkyOffice_1.SkyOffice, {
    name: 'Public Lobby',
    description: 'For making friends and familiarizing yourself with the controls',
    password: null,
    autoDispose: false,
});
gameServer.define(Rooms_1.RoomType.CUSTOM, SkyOffice_1.SkyOffice).enableRealtimeListing();
/**
 * Register @colyseus/social routes
 *
 * - uncomment if you want to use default authentication (https://docs.colyseus.io/server/authentication/)
 * - also uncomment the import statement
 */
// app.use("/", socialRoutes);
// register colyseus monitor AFTER registering your room handlers
app.use('/colyseus', (0, monitor_1.monitor)());
gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`);
