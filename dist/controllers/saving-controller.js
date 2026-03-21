"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonthSavings = exports.fundGoal = exports.deleteGoal = exports.updateGoal = exports.getGoals = exports.createGoal = void 0;
const zod_1 = require("zod");
const Account_1 = __importDefault(require("../models/Account"));
const Saving_1 = __importDefault(require("../models/Saving"));
const transaction_1 = require("../lib/transaction");
const Transaction_1 = require("../models/Transaction");
const route_handler_1 = require("../middleware/route-handler");
exports.createGoal = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const goalSchema = zod_1.z.object({
        name: zod_1.z.string().trim().min(2, "Name must be at least 2 characters"),
        category: zod_1.z.enum([
            "emergency",
            "vacation",
            "purchase",
            "education",
            "home",
            "other",
        ]),
        target: zod_1.z.object({
            amount: zod_1.z.number().default(0),
            date: zod_1.z.coerce.date(),
        }),
        autoSave: zod_1.z.number().default(0),
        roundUp: zod_1.z.boolean(),
    });
    const session = req.session;
    const parsed = goalSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Invalid goal information" });
    const foundAccount = await Account_1.default.findById(session.accountId, { _id: 1 });
    if (!foundAccount)
        return res.status(404).json({ message: "Account not found" });
    const goal = await Saving_1.default.create({
        accountId: session.accountId,
        name: parsed.data.name,
        target: parsed.data.target,
        category: parsed.data.category,
        autoSave: parsed.data.autoSave,
        roundUp: parsed.data.roundUp,
    });
    res.status(201).json({
        message: "Goal created successfully",
        goal: { _id: goal._id, name: goal.name },
    });
});
exports.getGoals = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const session = req.session;
    const foundAccount = await Account_1.default.findById(session.accountId, { _id: 1 });
    if (!foundAccount)
        return res.status(404).json({ message: "Account not found" });
    const goals = await Saving_1.default.find({ accountId: session.accountId })
        .lean()
        .exec();
    const getMonthDifference = (firstDate, secondDate) => {
        const start = new Date(firstDate);
        const end = new Date(secondDate);
        const yearDiff = end.getFullYear() - start.getFullYear();
        const monthDiff = end.getMonth() - start.getMonth();
        return yearDiff * 12 + monthDiff;
    };
    const parsedGoals = goals.map((goal) => {
        const monthly = (goal.balance / 100) * (goal.interest / 12);
        const monthDiff = getMonthDifference(new Date(goal.createdAt), new Date(Date.now()));
        const completed = goal.balance >= goal.target.amount;
        return {
            ...goal,
            completed,
            earned: {
                monthly,
                total: (monthDiff >= 0 ? monthDiff : 0) * monthly,
            },
        };
    });
    res.json({
        message: "Load successful",
        goals: parsedGoals,
    });
});
exports.updateGoal = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const updateSchema = zod_1.z.object({
        name: zod_1.z.string().min(2),
        target: zod_1.z.object({
            amount: zod_1.z.number().min(0),
            date: zod_1.z.coerce.date(),
        }),
        category: zod_1.z.string(),
        autoSave: zod_1.z.number().min(0),
        roundUp: zod_1.z.boolean(),
    });
    const session = req.session;
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Invalid update information" });
    const foundAccount = await Account_1.default.findById(session.accountId, { _id: 1 });
    if (!foundAccount)
        return res.status(404).json({ message: "Account not found" });
    const { goalId } = req.params;
    const updated = await Saving_1.default.updateOne({ _id: goalId }, {
        name: parsed.data.name,
        "target.date": parsed.data.target.date,
        "target.amount": parsed.data.target.amount,
        category: parsed.data.category,
        autoSave: parsed.data.autoSave,
        roundUp: parsed.data.roundUp,
    })
        .lean()
        .exec();
    if (!updated.modifiedCount)
        return res.status(404).json({
            message: "Goal not found",
        });
    res.json({
        message: "Updated successfully",
        updated: parsed.data,
    });
});
exports.deleteGoal = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const session = req.session;
    const foundAccount = await Account_1.default.findById(session.accountId, { _id: 1 });
    if (!foundAccount)
        return res.status(404).json({ message: "Account not found" });
    const { goalId } = req.params;
    const deleted = await Saving_1.default.deleteOne({ _id: goalId }).lean().exec();
    if (!deleted.deletedCount)
        return res.status(404).json({
            message: "Goal not found",
        });
    res.json({
        message: "Deleted successfully",
        deleted: true,
    });
});
exports.fundGoal = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const fundSchema = zod_1.z.object({
        amount: zod_1.z.number().min(1).max(Number.MAX_SAFE_INTEGER),
        pincode: zod_1.z
            .string()
            .trim()
            .regex(/^\d{4,6}$/),
    });
    const session = req.session;
    const parsed = fundSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Invalid funding information" });
    const foundAccount = await Account_1.default.findById(session.accountId);
    if (!foundAccount)
        return res.status(404).json({ message: "Account not found" });
    const { goalId } = req.params;
    const foundGoal = await Saving_1.default.findById(goalId);
    if (!foundGoal)
        return res.status(404).json({ message: "Goal not found" });
    if (!foundAccount.active)
        return res.status(403).json({ message: "Account blocked" });
    if (foundAccount.pincode !== parsed.data.pincode)
        return res.status(403).json({
            message: "Incorrect pin",
        });
    if (foundAccount.balance < parsed.data.amount)
        return res.status(403).json({
            message: "Insufficient funds",
        });
    foundAccount.balance -= parsed.data.amount;
    foundGoal.balance += parsed.data.amount;
    const transactionId = (0, transaction_1.generateTransactionId)(await (0, transaction_1.getTransactionCounter)());
    await (0, transaction_1.incrementTransactionCounter)();
    const transactionRef = (0, transaction_1.generateTransactionReference)();
    const savingTransaction = new Transaction_1.SavingTransaction({
        id: transactionId,
        reference: transactionRef,
        accountId: foundAccount._id,
        amount: parsed.data.amount,
        currency: foundAccount.currency,
        status: "completed",
        category: "Deposits",
        mode: "out",
        savingMode: "in",
        savingId: foundGoal._id,
        savingName: foundGoal.name,
        savingCategory: foundGoal.category,
    });
    await foundAccount.save();
    await foundGoal.save();
    await savingTransaction.save();
    res.json({
        message: "Funded goal successfully",
        goal: {
            amount: parsed.data.amount,
            completed: foundGoal.balance >= foundGoal.target.amount,
        },
    });
});
exports.getMonthSavings = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const session = req.session;
    const foundAccount = await Account_1.default.findById(session.accountId, { _id: 1 });
    if (!foundAccount)
        return res.status(404).json({ message: "Account not found" });
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const startOfNextMonth = new Date(startOfMonth);
    startOfNextMonth.setMonth(startOfNextMonth.getMonth() + 1);
    const transactions = await Transaction_1.SavingTransaction.find({
        savingMode: "in",
        accountId: session.accountId,
        createdAt: {
            $gte: startOfMonth,
            $lt: startOfNextMonth,
        },
    })
        .lean()
        .exec();
    const totalSavings = {
        amount: transactions.reduce((prev, curr) => prev + curr.amount, 0),
        transactionCount: transactions.length,
    };
    res.json({
        message: "Load successful",
        total: totalSavings,
    });
});
//# sourceMappingURL=saving-controller.js.map