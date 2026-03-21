"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const fileSchema = new mongoose_1.default.Schema({
    url: {
        type: String,
        required: true,
    },
    dimensions: {
        type: [Number, Number],
        required: true,
    },
    minified: String,
}, { _id: false });
const chatSchema = new mongoose_1.default.Schema({
    type: {
        type: String,
        enum: ["text", "image", "union"],
        required: true,
    },
    status: {
        type: String,
        enum: ["sending", "sent", "delivered", "read"],
        required: true,
    },
    accountId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        required: true,
    },
    content: {
        type: String,
        trim: true,
    },
    file: fileSchema,
}, { timestamps: true });
chatSchema.index({ accountId: 1, createdAt: -1 });
const Chat = mongoose_1.default.model("Chat", chatSchema);
exports.default = Chat;
//# sourceMappingURL=Chat.js.map