"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bill_controller_1 = require("../controllers/bill-controller");
const auth_handler_1 = require("../middleware/auth-handler");
const router = (0, express_1.Router)();
router.use(auth_handler_1.verifySessionUser);
router.route("/").post(bill_controller_1.createBill).get(bill_controller_1.getBills);
router.route("/:id").get(bill_controller_1.getAccountOrCard).patch(bill_controller_1.payBill).delete(bill_controller_1.deleteBill);
exports.default = router;
//# sourceMappingURL=bill.js.map