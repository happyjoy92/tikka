"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authUser = void 0;
const cookie_1 = require("cookie");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const session_1 = require("../../lib/session");
const authUser = (socket, next) => {
    try {
        const rawCookie = socket.handshake.headers.cookie;
        if (!rawCookie)
            return next(new Error("No cookies"));
        const cookies = (0, cookie_1.parseCookie)(rawCookie);
        const sessionToken = cookies[session_1.SESSION_KEY];
        if (!sessionToken)
            return next(new Error("No session"));
        const payload = jsonwebtoken_1.default.verify(sessionToken, process.env.JWT_SECRET);
        const session = { ...payload, token: sessionToken };
        socket.data.session = session;
        next();
    }
    catch (err) {
        next(new Error("Unauthorized"));
    }
};
exports.authUser = authUser;
//# sourceMappingURL=auth-handler.js.map