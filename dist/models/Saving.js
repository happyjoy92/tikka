"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const savingSchema = new mongoose_1.default.Schema({
    accountId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
    },
    name: {
        type: String,
        default: "",
    },
    balance: {
        type: Number,
        required: true,
        default: 0,
    },
    interest: {
        type: Number,
        required: true,
        default: 4.5,
    },
    target: {
        amount: {
            type: Number,
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
    },
    category: {
        type: String,
        enum: ["emergency", "vacation", "purchase", "education", "home", "other"],
        required: true,
    },
    autoSave: {
        type: Number,
        required: true,
        default: 0,
    },
    roundUp: {
        type: Boolean,
        required: true,
    },
}, { timestamps: true });
savingSchema.index({ accountId: 1 });
const Saving = mongoose_1.default.model("Saving", savingSchema);
exports.default = Saving;
//# sourceMappingURL=Saving.js.map