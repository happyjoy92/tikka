"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const cardSchema = new mongoose_1.default.Schema({
    accountId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
    },
    type: {
        type: String,
        default: "virtual",
        enum: {
            values: ["virtual", "physical"],
            message: "Invalid card type.",
        },
        required: true,
    },
    autoFreeze: {
        type: Boolean,
        default: false,
        required: true,
    },
    international: {
        type: Boolean,
        default: true,
        required: true,
    },
    online: {
        type: Boolean,
        default: true,
        required: true,
    },
    contactless: {
        type: Boolean,
        default: function () {
            return this.type === "physical";
        },
        required: true,
    },
    status: {
        type: String,
        default: "active",
        enum: {
            values: ["active", "blocked", "frozen", "pending", "shipping"],
            message: "Invalid card status.",
        },
        required: true,
    },
    name: {
        type: String,
        trim: true,
        default: "",
    },
    balance: {
        type: Number,
        required: true,
        default: 0,
    },
    limit: {
        type: Number,
        required: true,
    },
    cardNumber: {
        type: String,
        required: [true, "Card number is required."],
        match: [/^\d{16}$/, "Card number must be a 16-digit number."],
    },
    cvv: {
        type: String,
        required: [true, "CVV is required."],
        match: [/^\d{3,4}$/, "CVV must be 3 or 4 digits."],
    },
    expiration: {
        type: Date,
        required: [true, "Expiration date is required."],
        validate: {
            validator: function (v) {
                return v > new Date();
            },
            message: "Expiration date must be in the future.",
        },
    },
    issuer: {
        type: String,
        default: "Visa",
        enum: {
            values: ["Visa", "Mastercard", "Amex", "Discover"],
            message: "Invalid card issuer.",
        },
        required: true,
    },
}, { timestamps: true });
cardSchema.index({ accountId: 1, active: 1, expiration: 1 });
const Card = mongoose_1.default.model("Card", cardSchema);
exports.default = Card;
//# sourceMappingURL=Card.js.map