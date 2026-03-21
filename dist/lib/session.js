"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SESSION_KEY = void 0;
exports.createSession = createSession;
exports.getUser = getUser;
exports.getSessionUser = getSessionUser;
exports.destroySession = destroySession;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Session_1 = __importDefault(require("../models/Session"));
const geo_1 = require("./geo");
const Notification_1 = require("../models/Notification");
const SESSION_TTL = 1000 * 60 * 60 * 24 * 7;
exports.SESSION_KEY = "session";
const cookieOptions = {
    httpOnly: true,
    maxAge: SESSION_TTL,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
};
async function createSession(payload, req, res) {
    const sessionId = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET);
    const requestMeta = await (0, geo_1.extractRequestMeta)(req);
    const session = await Session_1.default.create({
        token: sessionId,
        accountId: payload.accountId,
        role: payload.role,
        expiresAt: new Date(Date.now() + SESSION_TTL),
        device: requestMeta.device,
        geolocation: requestMeta.geolocation,
        address: requestMeta.address,
    });
    await Notification_1.SecurityNotification.create({
        accountId: payload.accountId,
        priority: "high",
        securityType: "login",
    });
    res.cookie(exports.SESSION_KEY, sessionId, cookieOptions);
    return session;
}
function getUser(req) {
    const sessionId = req.cookies[exports.SESSION_KEY];
    if (!sessionId)
        return null;
    const payload = jsonwebtoken_1.default.verify(sessionId, process.env.JWT_SECRET);
    return payload;
}
async function getSessionUser(req) {
    const sessionId = req.cookies[exports.SESSION_KEY];
    if (!sessionId)
        return null;
    const session = await Session_1.default.findOne({ token: sessionId }).lean().exec();
    if (!session)
        return null;
    return {
        accountId: session.accountId.toString(),
        role: session.role,
    };
}
async function destroySession(req, res) {
    const sessionId = req.cookies[exports.SESSION_KEY];
    if (!sessionId)
        return;
    const session = await Session_1.default.findOneAndDelete({ token: sessionId })
        .lean()
        .exec();
    res.clearCookie(exports.SESSION_KEY, cookieOptions);
    if (!session)
        return;
    return session;
}
//# sourceMappingURL=session.js.map