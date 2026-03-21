"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.server = exports.app = void 0;
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_2 = __importDefault(require("./config/cors"));
const error_handler_1 = require("./middleware/error-handler");
const logger_1 = __importStar(require("./lib/logger"));
const auth_handler_1 = require("./middleware/socket/auth-handler");
const message_controller_1 = require("./controllers/socket/message-controller");
const account_1 = __importDefault(require("./routes/account"));
const transaction_1 = __importDefault(require("./routes/transaction"));
const transfer_1 = __importDefault(require("./routes/transfer"));
const notification_1 = __importDefault(require("./routes/notification"));
const push_1 = __importDefault(require("./routes/push"));
const bank_1 = __importDefault(require("./routes/bank"));
const card_1 = __importDefault(require("./routes/card"));
const saving_1 = __importDefault(require("./routes/saving"));
const bill_1 = __importDefault(require("./routes/bill"));
const request_1 = __importDefault(require("./routes/request"));
const chat_1 = __importDefault(require("./routes/chat"));
const app = (0, express_1.default)();
exports.app = app;
app.use((0, cors_1.default)(cors_2.default));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use("/account", account_1.default);
app.use("/notification", notification_1.default);
app.use("/push", push_1.default);
app.use("/transfer", transfer_1.default);
app.use("/transaction", transaction_1.default);
app.use("/bank", bank_1.default);
app.use("/card", card_1.default);
app.use("/saving", saving_1.default);
app.use("/bill", bill_1.default);
app.use("/request", request_1.default);
app.use("/chat", chat_1.default);
app.get("/healthz", async (req, res) => {
    try {
        res.status(200).json({ ok: true });
    }
    catch (error) {
        logger_1.default.error("Failed healthz check:", (0, logger_1.structureError)(error));
        res.status(500).json({ ok: false });
    }
});
app.use(express_1.default.static(path_1.default.join(process.cwd(), "web")));
app.use((req, res, next) => {
    if (req.method === "GET") {
        res.sendFile(path_1.default.join(process.cwd(), "web", "index.html"));
    }
    else
        next();
});
app.use(error_handler_1.errorHandler);
const server = http_1.default.createServer(app);
exports.server = server;
const io = new socket_io_1.Server(server, {
    cors: cors_2.default,
});
exports.io = io;
io.use(auth_handler_1.authUser);
io.on("connection", (socket) => {
    (0, message_controller_1.registerChat)(socket);
});
//# sourceMappingURL=server.js.map