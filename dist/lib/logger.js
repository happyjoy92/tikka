"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.structureError = structureError;
const node_1 = require("@logtail/node");
const isProd = process.env.NODE_ENV === "production";
class DevLogger {
    info(message, args) {
        console.log(`Info: ${message}`, args ?? {});
    }
    warn(message, args) {
        console.warn(`Warn: ${message}`, args ?? {});
    }
    error(message, args) {
        console.error(`Error: ${message}`, args ?? {});
    }
}
function structureError(error) {
    return {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        raw: error,
    };
}
const logger = isProd
    ? new node_1.Logtail(process.env.BETTER_STACK_SOURCE_TOKEN, {
        endpoint: process.env.BETTER_STACK_INGESTING_URL,
    })
    : new DevLogger();
exports.default = logger;
//# sourceMappingURL=logger.js.map