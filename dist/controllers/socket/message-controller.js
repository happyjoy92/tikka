"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerChat = void 0;
const zod_1 = require("zod");
const server_1 = require("../../server");
const PushToken_1 = __importDefault(require("../../models/PushToken"));
const push_1 = require("../../lib/push");
const Chat_1 = __importDefault(require("../../models/Chat"));
const socket_1 = require("../../lib/socket");
exports.registerChat = (0, socket_1.asyncHandler)(async (socket) => {
    const session = socket.data.session;
    const roomName = `chat:${session.accountId}`;
    socket.join(roomName);
    socket.on("send-message", async (id) => {
        const parsedPayload = zod_1.z.string(id).safeParse(id);
        if (parsedPayload.error)
            return socket.emit("error", new Error("Invalid message payload"));
        const chatId = parsedPayload.data;
        const chat = await Chat_1.default.findOne({
            _id: chatId,
            accountId: session.accountId,
        })
            .lean()
            .exec();
        if (!chat)
            return socket.emit("error", new Error("Chat not found"));
        const { accountId, ...formattedChat } = chat;
        socket.to(roomName).emit("new-message", formattedChat);
        const chatSockets = await server_1.io.in(roomName).fetchSockets();
        const activeSessions = chatSockets.map((s) => s.data.session.token);
        const pushTokens = await PushToken_1.default.find({
            accountId: session.accountId,
            sessionToken: { $nin: activeSessions },
            role: { $ne: session.role },
        })
            .select({ _id: 0, token: 1 })
            .lean()
            .exec();
        const pushes = pushTokens.map((pt) => pt.token);
        pushes.forEach((token) => {
            (0, push_1.sendPush)(token, {
                title: "Customer Support",
                body: formattedChat.content || "New message recieved",
            });
        });
    });
    socket.on("typing", () => {
        socket.to(roomName).emit("typing", session.role);
    });
}, (_err, socket) => {
    socket.emit("error", new Error("An error occured"));
});
//# sourceMappingURL=message-controller.js.map