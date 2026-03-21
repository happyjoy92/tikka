"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification-controller");
const auth_handler_1 = require("../middleware/auth-handler");
const router = (0, express_1.Router)();
router.use(auth_handler_1.verifySessionUser);
router.route("/").get(notification_controller_1.getNotifications).patch(notification_controller_1.updateNotifications);
router.route("/:id").patch(notification_controller_1.updateNotification).delete(notification_controller_1.deleteNotification);
exports.default = router;
//# sourceMappingURL=notification.js.map