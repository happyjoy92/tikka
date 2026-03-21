"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPush = void 0;
const firebase_1 = require("../services/firebase");
const sendPush = async (token, notification) => {
    await firebase_1.admin
        .messaging()
        .send({
        token,
        notification,
    })
        .catch((err) => console.log(err));
};
exports.sendPush = sendPush;
//# sourceMappingURL=push.js.map