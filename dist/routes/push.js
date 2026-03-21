"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const push_controller_1 = require("../controllers/push-controller");
const auth_handler_1 = require("../middleware/auth-handler");
const router = (0, express_1.Router)();
router.use(auth_handler_1.verifySessionUser);
router.post("/", push_controller_1.savePushToken);
exports.default = router;
//# sourceMappingURL=push.js.map