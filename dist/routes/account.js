"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const account_controller_1 = require("../controllers/account-controller");
const auth_handler_1 = require("../middleware/auth-handler");
const upload_handler_1 = require("../middleware/upload-handler");
const router = (0, express_1.Router)();
router.route("/").post(account_controller_1.registerAccount).put(account_controller_1.requestRegisterOtp);
router
    .route("/auth")
    .post(account_controller_1.loginAccount)
    .delete(account_controller_1.logoutAccount)
    .put(account_controller_1.requestAccountOtp);
router.use(auth_handler_1.verifySessionUser);
router.route("/").get(account_controller_1.getAccount).patch(upload_handler_1.upload.single("image"), account_controller_1.updateAccount);
router.get("/role", account_controller_1.getAccountRole);
router.get("/session", account_controller_1.getAccountSessions);
router.delete("/session/:id", account_controller_1.revokeSession);
router.get("/source", account_controller_1.getAccountSources);
router.post("/auth/pincode", account_controller_1.verifyAccountPincode);
router
    .route("/:number")
    .get(account_controller_1.getInternalTransferAccount)
    .post(account_controller_1.getTransferAccount);
exports.default = router;
//# sourceMappingURL=account.js.map