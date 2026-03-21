"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = asyncHandler;
function asyncHandler(handler, errorHandler) {
    return async (...args) => {
        try {
            return await handler(...args);
        }
        catch (err) {
            if (!errorHandler) {
                throw err;
            }
            return errorHandler(err, ...args);
        }
    };
}
//# sourceMappingURL=socket.js.map