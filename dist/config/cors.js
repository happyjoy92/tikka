"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const corsOptions = {
    credentials: true,
    origin: ["https://tikka.app", "https://www.tikka.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    exposedHeaders: ["Set-Cookie"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 600,
};
exports.default = corsOptions;
//# sourceMappingURL=cors.js.map