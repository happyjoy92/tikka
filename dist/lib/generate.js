"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTransactions = generateTransactions;
exports.generateCards = generateCards;
exports.generateSavings = generateSavings;
exports.generateBills = generateBills;
const Bill_1 = __importDefault(require("../models/Bill"));
const Card_1 = __importDefault(require("../models/Card"));
const Saving_1 = __importDefault(require("../models/Saving"));
const Transaction_1 = require("../models/Transaction");
const account_1 = require("./account");
const card_1 = require("./card");
const sytem_1 = require("./sytem");
const transaction_1 = require("./transaction");
async function generateTransactions(account) {
    const sysAccounts = await (0, account_1.getSystemAccounts)();
    const transRecords = (0, sytem_1.generateTransactionRecords)(250, new Date().getFullYear() - 1);
    const depositTxns = [];
    const transferTxns = [];
    let counter = await (0, transaction_1.getTransactionCounter)();
    await (0, transaction_1.incrementTransactionCounter)(sysAccounts.length);
    for (const tx of transRecords) {
        const sysAccount = sysAccounts[Math.floor(Math.random() * sysAccounts.length)];
        const transactionId = (0, transaction_1.generateTransactionId)(counter);
        counter += transaction_1.incrementBy;
        const transactionRef = (0, transaction_1.generateTransactionReference)();
        const types = ["email", "phone", "bank"];
        const type = types[Math.floor(Math.random() * types.length)];
        if (tx.mode === "in") {
            depositTxns.push({
                id: transactionId,
                reference: transactionRef,
                accountId: account._id,
                amount: tx.amount,
                fee: tx.fee,
                currency: sysAccount.currency,
                status: "completed",
                mode: "in",
                description: "",
                category: "Deposits",
                sender: sysAccount._id,
                depositType: type,
                createdAt: tx.createdAt,
            });
        }
        else {
            transferTxns.push({
                id: transactionId,
                reference: transactionRef,
                accountId: account._id,
                amount: tx.amount,
                fee: tx.fee,
                currency: account.currency,
                status: "completed",
                mode: "out",
                description: "",
                category: "Miscellaneous",
                recipient: sysAccount._id,
                transferType: type,
                speed: "instant",
                source: {
                    tag: "account",
                    id: account._id,
                },
                createdAt: tx.createdAt,
            });
        }
    }
    await Transaction_1.DepositTransaction.insertMany(depositTxns);
    await Transaction_1.TransferTransaction.insertMany(transferTxns);
}
async function generateCards(account) {
    const physical = (0, card_1.generateCard)("Mastercard", account.number);
    const virtual = (0, card_1.generateCard)("Visa", account.number);
    const physicalCard = {
        accountId: account._id,
        status: "active",
        type: "physical",
        name: "",
        autoFreeze: false,
        limit: 0,
        issuer: physical.issuer,
        cardNumber: physical.cardNumber,
        cvv: physical.cvv,
        expiration: physical.expiration,
    };
    const virtualCard = {
        accountId: account._id,
        status: "active",
        type: "virtual",
        name: "",
        autoFreeze: false,
        limit: 15000,
        issuer: virtual.issuer,
        cardNumber: virtual.cardNumber,
        cvv: virtual.cvv,
        expiration: virtual.expiration,
    };
    await Card_1.default.insertMany([physicalCard, virtualCard]);
}
async function generateSavings(account) {
    const goals = (0, sytem_1.generateGoals)();
    const savings = goals.map((goal) => ({
        accountId: account._id,
        name: goal.name,
        target: goal.target,
        balance: goal.target?.amount,
        category: goal.category,
        autoSave: goal.autoSave,
        roundUp: goal.roundUp,
    }));
    await Saving_1.default.insertMany(savings);
}
async function generateBills(account) {
    const billRecords = (0, sytem_1.generateBillRecords)();
    const bills = billRecords.map((rec) => ({
        accountId: account._id,
        name: rec.name,
        type: rec.type,
        amount: rec.amount,
        dueDay: rec.dueDay,
        frequency: rec.frequency,
        reminderDays: rec.reminderDays,
        autoPay: rec.autoPay,
    }));
    await Bill_1.default.insertMany(bills);
}
//# sourceMappingURL=generate.js.map