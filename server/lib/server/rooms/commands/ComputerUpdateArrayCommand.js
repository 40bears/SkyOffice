"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComputerRemoveUserCommand = exports.ComputerAddUserCommand = void 0;
const command_1 = require("@colyseus/command");
class ComputerAddUserCommand extends command_1.Command {
    execute(data) {
        const { client, computerId } = data;
        const computer = this.room.state.computers.get(computerId);
        const clientId = client.sessionId;
        if (!computer || computer.connectedUser.has(clientId))
            return;
        computer.connectedUser.add(clientId);
    }
}
exports.ComputerAddUserCommand = ComputerAddUserCommand;
class ComputerRemoveUserCommand extends command_1.Command {
    execute(data) {
        const { client, computerId } = data;
        const computer = this.state.computers.get(computerId);
        if (computer.connectedUser.has(client.sessionId)) {
            computer.connectedUser.delete(client.sessionId);
        }
    }
}
exports.ComputerRemoveUserCommand = ComputerRemoveUserCommand;
