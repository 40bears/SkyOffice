"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhiteboardRemoveUserCommand = exports.WhiteboardAddUserCommand = void 0;
const command_1 = require("@colyseus/command");
class WhiteboardAddUserCommand extends command_1.Command {
    execute(data) {
        const { client, whiteboardId } = data;
        const whiteboard = this.room.state.whiteboards.get(whiteboardId);
        const clientId = client.sessionId;
        if (!whiteboard || whiteboard.connectedUser.has(clientId))
            return;
        whiteboard.connectedUser.add(clientId);
    }
}
exports.WhiteboardAddUserCommand = WhiteboardAddUserCommand;
class WhiteboardRemoveUserCommand extends command_1.Command {
    execute(data) {
        const { client, whiteboardId } = data;
        const whiteboard = this.state.whiteboards.get(whiteboardId);
        if (whiteboard.connectedUser.has(client.sessionId)) {
            whiteboard.connectedUser.delete(client.sessionId);
        }
    }
}
exports.WhiteboardRemoveUserCommand = WhiteboardRemoveUserCommand;
