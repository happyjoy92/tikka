"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const otpSchema = new mongoose_1.default.Schema({
    type: {
        type: String,
        required: true,
        enum: ["auth", "transfer"],
        default: "auth",
    },
    code: {
        type: String,
        required: true,
    },
    target: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 },
    },
}, { timestamps: true });
const Otp = mongoose_1.default.model("Otp", otpSchema);
exports.default = Otp;
//# sourceMappingURL=Otp.js.map