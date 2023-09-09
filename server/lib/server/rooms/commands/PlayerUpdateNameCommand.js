"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@colyseus/command");
class PlayerUpdateNameCommand extends command_1.Command {
    execute(data) {
        const { client, name } = data;
        const player = this.room.state.players.get(client.sessionId);
        if (!player)
            return;
        player.name = name;
    }
}
exports.default = PlayerUpdateNameCommand;
