"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const requestSchema = new mongoose_1.default.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    accountId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
        index: true,
    },
    amount: {
        type: Number,
        min: 0,
        required: true,
    },
    description: {
        type: String,
        trim: true,
        required: true,
    },
    dueDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: ["pending", "paid"],
        required: true,
    },
}, {
    timestamps: true,
});
requestSchema.index({ dueDate: 1 }, { expireAfterSeconds: 0 });
const Request = mongoose_1.default.model("Request", requestSchema);
exports.default = Request;
//# sourceMappingURL=Request.js.map