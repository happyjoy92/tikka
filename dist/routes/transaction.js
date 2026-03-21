"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transaction_controller_1 = require("../controllers/transaction-controller");
const auth_handler_1 = require("../middleware/auth-handler");
const router = (0, express_1.Router)();
router.use(auth_handler_1.verifySessionUser);
router.route("/").get(transaction_controller_1.getTransactions);
router.route("/analytics").get(transaction_controller_1.getWeeklyAnalytics);
router.route("/card/:cardId").get(transaction_controller_1.getCardTransactions);
router.route("/saving/:savingId").get(transaction_controller_1.getSavingTransactions);
exports.default = router;
//# sourceMappingURL=transaction.js.map