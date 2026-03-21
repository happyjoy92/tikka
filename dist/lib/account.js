"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccountNumber = generateAccountNumber;
exports.getSystemAccounts = getSystemAccounts;
exports.matchPassword = matchPassword;
const crypto_1 = __importDefault(require("crypto"));
const Account_1 = __importDefault(require("../models/Account"));
const sytem_1 = require("./sytem");
function getRandomInt(min, max) {
    return crypto_1.default.randomInt(min, max + 1);
}
async function generateAccountNumber() {
    const accountNumber = Array.from({ length: 8 }, () => getRandomInt(0, 9)).join("");
    const exists = await Account_1.default.findOne({ number: accountNumber });
    if (exists)
        return generateAccountNumber();
    return accountNumber;
}
function matchPassword(password, value) {
    const isMatch = password === value;
    return isMatch;
}
async function getSystemAccounts() {
    const sytemAccounts = await Account_1.default.find({ type: "system" }).lean().exec();
    if (!sytemAccounts.length) {
        const users = (0, sytem_1.generateUsers)(50);
        const accounts = [];
        for (const user of users) {
            const accountNumber = await generateAccountNumber();
            accounts.push({
                ...user,
                type: "system",
                number: accountNumber,
                active: true,
                verified: true,
                limit: 100000000,
                balance: 100000000,
                currency: "EUR",
                password: "sys0000",
                pincode: "0000",
                document: "passport",
            });
        }
        const docs = await Account_1.default.insertMany(accounts);
        return docs.map((doc) => doc.toObject());
    }
    else
        return sytemAccounts;
}
//# sourceMappingURL=account.js.map