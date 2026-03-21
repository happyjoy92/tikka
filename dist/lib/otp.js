"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestOtp = requestOtp;
exports.verifyOtp = verifyOtp;
const crypto_1 = __importDefault(require("crypto"));
const Otp_1 = __importDefault(require("../models/Otp"));
const OTP_TTL = 60 * 10;
async function requestOtp(type, target) {
    const code = crypto_1.default.randomInt(100000, 999999).toString();
    await Otp_1.default.create({
        code,
        target,
        expiresAt: new Date(Date.now() + OTP_TTL),
    });
    if (type !== "email")
        return code;
    console.log(`OTP for: ${target}. CODE: ${code}`);
    return code;
}
async function verifyOtp(target, code) {
    const otp = await Otp_1.default.findOneAndDelete({ target, code });
    if (!otp)
        return false;
    return true;
}
//# sourceMappingURL=otp.js.map