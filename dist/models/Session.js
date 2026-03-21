"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const sessionSchema = new mongoose_1.default.Schema({
    token: {
        type: String,
        required: true,
        index: true,
    },
    accountId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
        index: true,
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        required: true,
        index: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 },
    },
    device: {
        type: {
            type: String,
            enum: ["phone", "computer", "unknown"],
            default: "unknown",
        },
        platform: {
            type: String,
            enum: ["ios", "android", "windows", "macos", "linux", "unknown"],
            default: "unknown",
        },
    },
    geolocation: {
        lat: { type: Number, min: -90, max: 90 },
        lon: { type: Number, min: -180, max: 180 },
    },
    address: {
        type: String,
        trim: true,
    },
}, { timestamps: true });
sessionSchema.index({ createdAt: -1 });
const Session = mongoose_1.default.model("Session", sessionSchema);
exports.default = Session;
//# sourceMappingURL=Session.js.map