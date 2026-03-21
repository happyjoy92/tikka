"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_handler_1 = require("../middleware/auth-handler");
const chat_controller_1 = require("../controllers/chat-controller");
const upload_handler_1 = require("../middleware/upload-handler");
const router = (0, express_1.Router)();
router.use(auth_handler_1.verifyUser);
router.route("/").get(chat_controller_1.getChats).post(upload_handler_1.upload.single("image"), chat_controller_1.newChat);
router.get("/agent", chat_controller_1.getChatAgent);
router.get("/:chatId", chat_controller_1.getChat);
exports.default = router;
//# sourceMappingURL=chat.js.map