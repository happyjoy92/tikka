"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const billSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        trim: true,
        default: "",
    },
    accountId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
        index: true,
    },
    payee: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Account",
    },
    type: {
        type: String,
        enum: ["utility", "subscription", "loan", "insurance", "other"],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    dueDay: {
        type: Number,
        required: true,
        min: 1,
        max: 31,
    },
    frequency: {
        type: String,
        enum: ["monthly", "quarterly", "yearly"],
        required: true,
    },
    reminderDays: {
        type: Number,
        required: true,
        min: 1,
        max: 31,
    },
    autoPay: {
        type: Boolean,
        default: false,
        required: true,
    },
    lastPayment: {
        type: Date,
    },
}, {
    timestamps: true,
});
billSchema.index({
    accountId: 1,
    payee: 1,
    type: 1,
    category: 1,
    dueDate: 1,
    lastPayment: 1,
});
const Bill = mongoose_1.default.model("Bill", billSchema);
exports.default = Bill;
//# sourceMappingURL=Bill.js.map