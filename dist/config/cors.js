"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const corsOptions = {
    credentials: true,
    origin: [
        "http://localhost:5000",
        "http://172.20.10.6:8080",
        "http://10.15.245.81:8080",
        "http://localhost:8080",
        "https://app.local",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    exposedHeaders: ["Set-Cookie"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 600,
};
exports.default = corsOptions;
//# sourceMappingURL=cors.js.map