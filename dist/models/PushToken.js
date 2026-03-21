"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const pushTokenSchema = new mongoose_1.default.Schema({
    accountId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        required: true,
        index: true,
    },
    sessionToken: {
        type: String,
        required: true,
        index: true,
    },
    token: {
        type: String,
        required: true,
        index: true,
    },
    userAgent: {
        type: String,
        required: true,
    },
    lastSeenAt: {
        type: Date,
    },
}, { timestamps: true });
const PushToken = mongoose_1.default.model("Push", pushTokenSchema);
exports.default = PushToken;
//# sourceMappingURL=PushToken.js.map