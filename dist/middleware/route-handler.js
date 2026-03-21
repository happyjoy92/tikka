"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncAuthRoute = exports.asyncRoute = void 0;
const asyncRoute = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
exports.asyncRoute = asyncRoute;
const asyncAuthRoute = (fn) => (req, res, next) => {
    if (!("session" in req) || !req.session) {
        const err = new Error("Unauthorized");
        err.status = 401;
        return next(err);
    }
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.asyncAuthRoute = asyncAuthRoute;
//# sourceMappingURL=route-handler.js.map