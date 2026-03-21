"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transfer_controller_1 = require("../controllers/transfer-controller");
const auth_handler_1 = require("../middleware/auth-handler");
const router = (0, express_1.Router)();
router.use(auth_handler_1.verifySessionUser);
router.route("/").post(transfer_controller_1.sendMoney).get(transfer_controller_1.getTransfers);
router.put("/auth", transfer_controller_1.requestTransferOtp);
router.get("/rates", transfer_controller_1.getCurrencyRates);
exports.default = router;
//# sourceMappingURL=transfer.js.map