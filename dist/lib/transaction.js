"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementTransactionCounter = exports.getTransactionCounter = exports.incrementBy = void 0;
exports.generateTransactionId = generateTransactionId;
exports.generateTransactionReference = generateTransactionReference;
const Counter_1 = __importDefault(require("../models/Counter"));
const counterId = "Transaction";
const startAt = 617423942;
const incrementBy = 417;
exports.incrementBy = incrementBy;
const getTransactionCounter = async () => {
    const counter = await Counter_1.default.findOne({
        _id: counterId,
    })
        .lean()
        .exec();
    if (counter) {
        return counter.value;
    }
    else {
        await Counter_1.default.create({
            _id: counterId,
            value: startAt,
        });
        return startAt;
    }
};
exports.getTransactionCounter = getTransactionCounter;
const incrementTransactionCounter = async (times = 1) => {
    await Counter_1.default.updateOne({ _id: counterId }, { $inc: { value: incrementBy * times } })
        .lean()
        .exec();
};
exports.incrementTransactionCounter = incrementTransactionCounter;
function generateTransactionId(counter) {
    return `TKA-${counter}`;
}
function generateTransactionReference() {
    const randomNumberPrefix = Math.floor(1000 + Math.random() * 9000);
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomPart = [...Array(14)]
        .map(() => Math.random().toString(36)[2].toUpperCase())
        .join("");
    return `${randomNumberPrefix}${date}${randomPart}`;
}
//# sourceMappingURL=transaction.js.map