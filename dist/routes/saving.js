"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const saving_controller_1 = require("../controllers/saving-controller");
const auth_handler_1 = require("../middleware/auth-handler");
const router = (0, express_1.Router)();
router.use(auth_handler_1.verifySessionUser);
router.route("/").post(saving_controller_1.createGoal).get(saving_controller_1.getGoals);
router.route("/total").get(saving_controller_1.getMonthSavings);
router.route("/:goalId").patch(saving_controller_1.updateGoal).put(saving_controller_1.fundGoal).delete(saving_controller_1.deleteGoal);
exports.default = router;
//# sourceMappingURL=saving.js.map