"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const server_1 = require("./server");
const db_1 = __importDefault(require("./config/db"));
const PORT = process.env.PORT || 5000;
(0, db_1.default)().then(() => server_1.server.listen(PORT, () => console.log(`API + Socket running on port ${PORT}`)));
//# sourceMappingURL=index.js.map