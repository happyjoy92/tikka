"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatAgent = exports.getChats = exports.getChat = exports.newChat = void 0;
const sharp_1 = __importDefault(require("sharp"));
const zod_1 = require("zod");
const route_handler_1 = require("../middleware/route-handler");
const Chat_1 = __importDefault(require("../models/Chat"));
const cloudinary_1 = require("../services/cloudinary");
const PAGE_SIZE = 30;
exports.newChat = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const chatSchema = zod_1.z.object({
        message: zod_1.z.string().trim().optional(),
    });
    const session = req.session;
    const parsed = chatSchema.safeParse(req.body);
    if (parsed.error && !req.file)
        return res.status(400).json({ message: "Invalid chat information" });
    const message = parsed.data?.message;
    let file;
    if (req.file) {
        const processedImageBuffer = await (0, sharp_1.default)(req.file.buffer)
            .resize({ width: 500, withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toBuffer();
        const { width, height } = await (0, sharp_1.default)(processedImageBuffer).metadata();
        const tinyImageBuffer = await (0, sharp_1.default)(req.file.buffer)
            .resize({ width: 20, withoutEnlargement: true })
            .jpeg({ quality: 50 })
            .toBuffer();
        const url = await (0, cloudinary_1.storeImage)(processedImageBuffer);
        const minified = `data:image/jpeg;base64,${tinyImageBuffer.toString("base64")}`;
        file = {
            url,
            dimensions: [width, height],
            minified,
        };
    }
    const chat = await Chat_1.default.create({
        type: message && file ? "union" : message ? "text" : "image",
        status: "sent",
        accountId: session.accountId,
        role: session.role,
        content: message,
        file,
    });
    const { accountId, ...formattedChat } = chat.toObject();
    res.status(201).json({
        message: "New chat created successfully",
        chat: formattedChat,
    });
});
exports.getChat = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const session = req.session;
    const { chatId } = req.params;
    const chat = await Chat_1.default.findOne({
        _id: chatId,
        accountId: session.accountId,
    })
        .lean()
        .exec();
    if (!chat)
        return res.status(404).json({ message: "Chat not found" });
    const { accountId, ...formattedChat } = chat;
    res.json({
        message: "Load successful",
        chat: formattedChat,
    });
});
exports.getChats = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const querySchema = zod_1.z.object({
        cursor: zod_1.z.coerce.date().optional(),
    });
    const session = req.session;
    const parsed = querySchema.safeParse(req.query);
    if (parsed.error)
        return res.status(400).json({ message: "Invalid query information" });
    const { cursor } = parsed.data;
    const query = { accountId: session.accountId };
    if (cursor) {
        query.createdAt = { $lt: cursor };
    }
    const chats = await Chat_1.default.find(query)
        .sort({ createdAt: -1 })
        .limit(PAGE_SIZE)
        .lean()
        .exec();
    const formattedChats = chats.map(({ accountId, ...chat }) => chat);
    res.json({
        message: "Load successful",
        chats: formattedChats,
        nextCursor: chats.length === PAGE_SIZE ? chats[chats.length - 1].createdAt : null,
    });
});
exports.getChatAgent = (0, route_handler_1.asyncAuthRoute)(async (_req, res) => {
    const agents = (await Promise.resolve().then(() => __importStar(require("../data/agents.json")))).default;
    if (!agents.length)
        res.status(404).json({ message: "No agent at the moment" });
    const agentWithDays = agents.map((a) => ({ ...a, days: 1 }));
    const day = new Date().getDay() + 1;
    let index = 0;
    for (let r = day - agents.length; r > 0; r--) {
        agentWithDays[index].days += 1;
        if (index === agentWithDays.length - 1)
            index = 0;
        else
            index += 1;
    }
    let total = 0;
    let target;
    for (const { days, ...agent } of agentWithDays) {
        total += days;
        if (total === day) {
            target = agent;
            break;
        }
    }
    if (!target)
        return res.status(404).json({ message: "No agent at the moment" });
    res.json({
        message: "Load successful",
        agent: target,
    });
});
//# sourceMappingURL=chat-controller.js.map