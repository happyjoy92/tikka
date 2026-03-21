"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bank_controller_1 = require("../controllers/bank-controller");
const router = (0, express_1.Router)();
router.get("/", bank_controller_1.getBanks);
router.get("/popular", bank_controller_1.getPopularBanks);
router.get("/:number", bank_controller_1.bankLookup);
exports.default = router;
//# sourceMappingURL=bank.js.map