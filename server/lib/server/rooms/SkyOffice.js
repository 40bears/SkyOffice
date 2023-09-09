"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkyOffice = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const colyseus_1 = require("colyseus");
const command_1 = require("@colyseus/command");
const OfficeState_1 = require("./schema/OfficeState");
const Messages_1 = require("../../types/Messages");
const OfficeState_2 = require("./schema/OfficeState");
const PlayerUpdateCommand_1 = __importDefault(require("./commands/PlayerUpdateCommand"));
const PlayerUpdateNameCommand_1 = __importDefault(require("./commands/PlayerUpdateNameCommand"));
const ComputerUpdateArrayCommand_1 = require("./commands/ComputerUpdateArrayCommand");
const WhiteboardUpdateArrayCommand_1 = require("./commands/WhiteboardUpdateArrayCommand");
const ChatMessageUpdateCommand_1 = __importDefault(require("./commands/ChatMessageUpdateCommand"));
class SkyOffice extends colyseus_1.Room {
    constructor() {
        super(...arguments);
        this.dispatcher = new command_1.Dispatcher(this);
        this.password = null;
    }
    onCreate(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, description, password, autoDispose } = options;
            this.name = name;
            this.description = description;
            this.autoDispose = autoDispose;
            let hasPassword = false;
            if (password) {
                const salt = yield bcrypt_1.default.genSalt(10);
                this.password = yield bcrypt_1.default.hash(password, salt);
                hasPassword = true;
            }
            this.setMetadata({ name, description, hasPassword });
            this.setState(new OfficeState_1.OfficeState());
            // HARD-CODED: Add 5 computers in a room
            for (let i = 0; i < 5; i++) {
                this.state.computers.set(String(i), new OfficeState_1.Computer());
            }
            // HARD-CODED: Add 3 whiteboards in a room
            for (let i = 0; i < 3; i++) {
                this.state.whiteboards.set(String(i), new OfficeState_1.Whiteboard());
            }
            // when a player connect to a computer, add to the computer connectedUser array
            this.onMessage(Messages_1.Message.CONNECT_TO_COMPUTER, (client, message) => {
                this.dispatcher.dispatch(new ComputerUpdateArrayCommand_1.ComputerAddUserCommand(), {
                    client,
                    computerId: message.computerId,
                });
            });
            // when a player disconnect from a computer, remove from the computer connectedUser array
            this.onMessage(Messages_1.Message.DISCONNECT_FROM_COMPUTER, (client, message) => {
                this.dispatcher.dispatch(new ComputerUpdateArrayCommand_1.ComputerRemoveUserCommand(), {
                    client,
                    computerId: message.computerId,
                });
            });
            // when a player stop sharing screen
            this.onMessage(Messages_1.Message.STOP_SCREEN_SHARE, (client, message) => {
                const computer = this.state.computers.get(message.computerId);
                computer.connectedUser.forEach((id) => {
                    this.clients.forEach((cli) => {
                        if (cli.sessionId === id && cli.sessionId !== client.sessionId) {
                            cli.send(Messages_1.Message.STOP_SCREEN_SHARE, client.sessionId);
                        }
                    });
                });
            });
            // when a player connect to a whiteboard, add to the whiteboard connectedUser array
            this.onMessage(Messages_1.Message.CONNECT_TO_WHITEBOARD, (client, message) => {
                this.dispatcher.dispatch(new WhiteboardUpdateArrayCommand_1.WhiteboardAddUserCommand(), {
                    client,
                    whiteboardId: message.whiteboardId,
                });
            });
            // when a player disconnect from a whiteboard, remove from the whiteboard connectedUser array
            this.onMessage(Messages_1.Message.DISCONNECT_FROM_WHITEBOARD, (client, message) => {
                this.dispatcher.dispatch(new WhiteboardUpdateArrayCommand_1.WhiteboardRemoveUserCommand(), {
                    client,
                    whiteboardId: message.whiteboardId,
                });
            });
            // when receiving updatePlayer message, call the PlayerUpdateCommand
            this.onMessage(Messages_1.Message.UPDATE_PLAYER, (client, message) => {
                this.dispatcher.dispatch(new PlayerUpdateCommand_1.default(), {
                    client,
                    x: message.x,
                    y: message.y,
                    anim: message.anim,
                });
            });
            // when receiving updatePlayerName message, call the PlayerUpdateNameCommand
            this.onMessage(Messages_1.Message.UPDATE_PLAYER_NAME, (client, message) => {
                this.dispatcher.dispatch(new PlayerUpdateNameCommand_1.default(), {
                    client,
                    name: message.name,
                });
            });
            // when a player is ready to connect, call the PlayerReadyToConnectCommand
            this.onMessage(Messages_1.Message.READY_TO_CONNECT, (client) => {
                const player = this.state.players.get(client.sessionId);
                if (player)
                    player.readyToConnect = true;
            });
            // when a player is ready to connect, call the PlayerReadyToConnectCommand
            this.onMessage(Messages_1.Message.VIDEO_CONNECTED, (client) => {
                const player = this.state.players.get(client.sessionId);
                if (player)
                    player.videoConnected = true;
            });
            // when a player disconnect a stream, broadcast the signal to the other player connected to the stream
            this.onMessage(Messages_1.Message.DISCONNECT_STREAM, (client, message) => {
                this.clients.forEach((cli) => {
                    if (cli.sessionId === message.clientId) {
                        cli.send(Messages_1.Message.DISCONNECT_STREAM, client.sessionId);
                    }
                });
            });
            // when a player send a chat message, update the message array and broadcast to all connected clients except the sender
            this.onMessage(Messages_1.Message.ADD_CHAT_MESSAGE, (client, message) => {
                // update the message array (so that players join later can also see the message)
                this.dispatcher.dispatch(new ChatMessageUpdateCommand_1.default(), {
                    client,
                    content: message.content,
                });
                // broadcast to all currently connected clients except the sender (to render in-game dialog on top of the character)
                this.broadcast(Messages_1.Message.ADD_CHAT_MESSAGE, { clientId: client.sessionId, content: message.content }, { except: client });
            });
        });
    }
    onAuth(client, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.password) {
                const validPassword = yield bcrypt_1.default.compare(options.password, this.password);
                if (!validPassword) {
                    throw new colyseus_1.ServerError(403, 'Password is incorrect!');
                }
            }
            return true;
        });
    }
    onJoin(client, options) {
        this.state.players.set(client.sessionId, new OfficeState_1.Player());
        client.send(Messages_1.Message.SEND_ROOM_DATA, {
            id: this.roomId,
            name: this.name,
            description: this.description,
        });
    }
    onLeave(client, consented) {
        if (this.state.players.has(client.sessionId)) {
            this.state.players.delete(client.sessionId);
        }
        this.state.computers.forEach((computer) => {
            if (computer.connectedUser.has(client.sessionId)) {
                computer.connectedUser.delete(client.sessionId);
            }
        });
        this.state.whiteboards.forEach((whiteboard) => {
            if (whiteboard.connectedUser.has(client.sessionId)) {
                whiteboard.connectedUser.delete(client.sessionId);
            }
        });
    }
    onDispose() {
        this.state.whiteboards.forEach((whiteboard) => {
            if (OfficeState_2.whiteboardRoomIds.has(whiteboard.roomId))
                OfficeState_2.whiteboardRoomIds.delete(whiteboard.roomId);
        });
        console.log('room', this.roomId, 'disposing...');
        this.dispatcher.stop();
    }
}
exports.SkyOffice = SkyOffice;
