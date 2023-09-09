"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@colyseus/command");
const OfficeState_1 = require("../schema/OfficeState");
class ChatMessageUpdateCommand extends command_1.Command {
    execute(data) {
        const { client, content } = data;
        const player = this.room.state.players.get(client.sessionId);
        const chatMessages = this.room.state.chatMessages;
        if (!chatMessages)
            return;
        /**
         * Only allow server to store a maximum of 100 chat messages:
         * remove the first element before pushing a new one when array length is >= 100
         */
        if (chatMessages.length >= 100)
            chatMessages.shift();
        const newMessage = new OfficeState_1.ChatMessage();
        newMessage.author = player.name;
        newMessage.content = content;
        chatMessages.push(newMessage);
    }
}
exports.default = ChatMessageUpdateCommand;
