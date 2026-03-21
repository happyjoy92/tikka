"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const request_controller_1 = require("../controllers/request-controller");
const auth_handler_1 = require("../middleware/auth-handler");
const router = (0, express_1.Router)();
router.use(auth_handler_1.verifySessionUser);
router.route("/").post(request_controller_1.createPaymentRequest).get(request_controller_1.getPaymentRequests);
router.route("/:id").delete(request_controller_1.cancelPaymentRequest);
exports.default = router;
//# sourceMappingURL=request.js.map