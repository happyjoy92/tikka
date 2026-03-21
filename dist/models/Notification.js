"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityNotification = exports.TransactionNotification = exports.Notification = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const notificationSchema = new mongoose_1.default.Schema({
    accountId: {
        type: mongoose_1.default.SchemaTypes.ObjectId,
        ref: "Account",
        required: true,
    },
    type: {
        type: String,
        enum: ["security", "transaction"],
        required: true,
    },
    read: {
        type: Boolean,
        required: true,
        default: false,
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        required: true,
    },
}, {
    timestamps: true,
    discriminatorKey: "type",
});
notificationSchema.index({ accountId: 1, createdAt: -1 });
exports.Notification = mongoose_1.default.model("Notification", notificationSchema);
const transactionNotificationSchema = new mongoose_1.default.Schema({
    transaction: {
        type: mongoose_1.default.SchemaTypes.ObjectId,
        ref: "Transaction",
        required: true,
    },
});
exports.TransactionNotification = exports.Notification.discriminator("transaction", transactionNotificationSchema);
const securityNotificationSchema = new mongoose_1.default.Schema({
    securityType: {
        type: String,
        enum: ["login", "password"],
        required: true,
    },
});
exports.SecurityNotification = exports.Notification.discriminator("security", securityNotificationSchema);
//# sourceMappingURL=Notification.js.map