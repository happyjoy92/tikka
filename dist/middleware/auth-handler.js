"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySessionUser = exports.verifyUser = void 0;
const session_1 = require("../lib/session");
const verifyUser = (req, res, next) => {
    const session = (0, session_1.getUser)(req);
    if (!session)
        return res.status(401).json({ message: "Session expired" });
    req.session = session;
    next();
};
exports.verifyUser = verifyUser;
const verifySessionUser = async (req, res, next) => {
    const session = await (0, session_1.getSessionUser)(req);
    if (!session)
        return res.status(401).json({ message: "Session expired" });
    req.session = session;
    next();
};
exports.verifySessionUser = verifySessionUser;
//# sourceMappingURL=auth-handler.js.map