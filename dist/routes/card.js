"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const card_controller_1 = require("../controllers/card-controller");
const auth_handler_1 = require("../middleware/auth-handler");
const router = (0, express_1.Router)();
router.use(auth_handler_1.verifySessionUser);
router.route("/").post(card_controller_1.createCard).get(card_controller_1.getCards).put(card_controller_1.verifyCard);
router.route("/:cardId").post(card_controller_1.getCard).patch(card_controller_1.updateCard).put(card_controller_1.fundCard);
exports.default = router;
//# sourceMappingURL=card.js.map