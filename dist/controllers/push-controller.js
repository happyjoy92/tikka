"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.savePushToken = void 0;
const zod_1 = require("zod");
const PushToken_1 = __importDefault(require("../models/PushToken"));
const route_handler_1 = require("../middleware/route-handler");
const session_1 = require("../lib/session");
exports.savePushToken = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const tokenSchema = zod_1.z.object({
        token: zod_1.z.string(),
    });
    const parsed = tokenSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Invalid token information" });
    const sessionToken = req.cookies[session_1.SESSION_KEY];
    const session = req.session;
    await PushToken_1.default.updateOne({ accountId: session.accountId, token: parsed.data.token }, {
        accountId: session.accountId,
        token: parsed.data.token,
        sessionToken,
        userAgent: req.headers["user-agent"],
        lastSeenAt: new Date(),
    }, { upsert: true });
    res.sendStatus(204);
});
//# sourceMappingURL=push-controller.js.map