"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavingTransaction = exports.CardTransaction = exports.TransferTransaction = exports.DepositTransaction = exports.Transaction = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const transactionSchema = new mongoose_1.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    reference: {
        type: String,
        required: true,
        index: true,
    },
    accountId: {
        type: mongoose_1.Types.ObjectId,
        ref: "Account",
        required: true,
        index: true,
    },
    amount: {
        type: Number,
        min: 0,
        required: true,
    },
    fee: {
        type: Number,
        default: 0,
        required: true,
    },
    currency: {
        type: String,
        enum: ["USD", "EUR"],
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "completed", "failed", "reversed"],
        required: true,
        index: true,
    },
    mode: {
        type: String,
        enum: ["in", "out"],
        required: true,
    },
    description: {
        type: String,
        trim: true,
    },
    note: {
        type: String,
        trim: true,
    },
    metadata: {
        type: mongoose_1.Schema.Types.Mixed,
    },
    category: {
        type: String,
        enum: [
            "Food & Drink",
            "Shopping",
            "Groceries",
            "Transportation",
            "Housing",
            "Utilities",
            "Entertainment",
            "Subscriptions",
            "Healthcare",
            "Travel",
            "Income",
            "Fees",
            "Gifts",
            "Refunds",
            "Deposits",
            "Withdrawals",
            "Interests",
            "Autosave",
            "Miscellaneous",
        ],
        required: true,
    },
}, {
    timestamps: true,
    discriminatorKey: "type",
});
exports.Transaction = mongoose_1.default.model("Transaction", transactionSchema);
const depositTransactionSchema = new mongoose_1.Schema({
    sender: {
        type: mongoose_1.Types.ObjectId,
        ref: "Account",
        required: true,
    },
    depositType: {
        type: String,
        enum: ["email", "phone", "bank"],
        required: true,
    },
});
exports.DepositTransaction = exports.Transaction.discriminator("deposit", depositTransactionSchema);
const transferTransactionSchema = new mongoose_1.Schema({
    recipient: {
        type: mongoose_1.Types.ObjectId,
        ref: "Account",
        required: true,
    },
    transferType: {
        type: String,
        enum: ["email", "phone", "bank"],
        required: true,
    },
    speed: {
        type: String,
        enum: ["instant", "scheduled"],
        required: true,
    },
    source: {
        id: {
            type: mongoose_1.default.Schema.Types.ObjectId,
            required: true,
        },
        tag: {
            type: String,
            enum: ["account", "card", "saving"],
            required: true,
        },
    },
    scheduledDate: {
        type: Date,
    },
});
exports.TransferTransaction = exports.Transaction.discriminator("transfer", transferTransactionSchema);
const cardTransactionSchema = new mongoose_1.Schema({
    cardId: {
        type: mongoose_1.Types.ObjectId,
        ref: "Card",
        required: true,
        index: true,
    },
    cardNumber: {
        type: String,
        required: true,
    },
    cardName: {
        type: String,
        required: true,
    },
    cardMode: {
        type: String,
        enum: ["in", "out"],
        required: true,
    },
    merchant: {
        type: String,
    },
});
exports.CardTransaction = exports.Transaction.discriminator("card", cardTransactionSchema);
const savingTransactionSchema = new mongoose_1.Schema({
    savingId: {
        type: mongoose_1.Types.ObjectId,
        ref: "Saving",
        required: true,
        index: true,
    },
    savingName: {
        type: String,
        required: true,
    },
    savingMode: {
        type: String,
        enum: ["in", "out", "interest"],
        required: true,
    },
    savingCategory: {
        type: String,
    },
});
exports.SavingTransaction = exports.Transaction.discriminator("saving", savingTransactionSchema);
//# sourceMappingURL=Transaction.js.map