"use strict";
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
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_2 = __importDefault(require("./config/cors"));
const error_handler_1 = require("./middleware/error-handler");
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
const zod_1 = require("zod");
const app = (0, express_1.default)();
exports.app = app;
app.use((0, cors_1.default)(cors_2.default));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
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
        console.log(error);
        res.status(500).json({ ok: false });
    }
});
app.post("/log", (req, res) => {
    const logSchema = zod_1.z.object({
        level: zod_1.z.enum(["info", "error", "warn"]),
        message: zod_1.z.string().min(1).max(500),
        meta: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
        source: zod_1.z.string().optional(),
        url: zod_1.z.string().optional(),
        userAgent: zod_1.z.string().optional(),
        timestamp: zod_1.z.string().optional(),
    });
    const parsed = logSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Invalid log payload",
        });
    }
    console.log(parsed.data);
    res.sendStatus(200);
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