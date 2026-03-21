"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBill = exports.payBill = exports.getAccountOrCard = exports.getBills = exports.createBill = void 0;
const zod_1 = require("zod");
const Account_1 = __importDefault(require("../models/Account"));
const Bill_1 = __importDefault(require("../models/Bill"));
const Card_1 = __importDefault(require("../models/Card"));
const route_handler_1 = require("../middleware/route-handler");
exports.createBill = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const billSchema = zod_1.z.object({
        pincode: zod_1.z
            .string()
            .trim()
            .regex(/^\d{4,6}$/),
        name: zod_1.z.string().trim().min(2, "Name must be at least 2 characters"),
        accountNumber: zod_1.z.string().trim(),
        type: zod_1.z.enum(["utility", "subscription", "loan", "insurance", "other"]),
        amount: zod_1.z.number().min(1),
        dueDay: zod_1.z.number().min(1).max(31),
        frequency: zod_1.z.enum(["weekly", "monthly", "quarterly", "yearly"]),
        reminderDays: zod_1.z.number().min(1).max(31),
        autoPay: zod_1.z.boolean(),
    });
    const accountId = req.session;
    const parsed = billSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Invalid bill information" });
    if (!accountId)
        return res.status(401).json({ message: "Session expired" });
    const foundAccount = await Account_1.default.findById(accountId, {
        _id: 1,
        pincode: 1,
    });
    if (!foundAccount)
        return res.status(404).json({ message: "Account not found" });
    if (foundAccount.pincode !== parsed.data.pincode)
        return res.status(403).json({
            message: "Incorrect pin",
        });
    if (foundAccount.balance < parsed.data.amount)
        return res.status(403).json({
            message: "Insufficient funds",
        });
    const payeeAccount = await Account_1.default.findOne({ number: parsed.data.accountNumber }, { _id: 1 })
        .lean()
        .exec();
    if (!payeeAccount)
        return res.status(404).json({ message: "Recipient account not found" });
    const newBill = await Bill_1.default.create({
        name: parsed.data.name,
        accountId: foundAccount._id,
        payee: payeeAccount._id,
        type: parsed.data.type,
        amount: parsed.data.amount,
        dueDay: parsed.data.dueDay,
        frequency: parsed.data.frequency,
        reminderDays: parsed.data.reminderDays,
        autoPay: parsed.data.autoPay,
    });
    res.status(201).json({
        message: "Bill created successfully",
        bill: { _id: newBill._id, name: newBill.name },
    });
});
exports.getBills = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const session = req.session;
    const foundAccount = await Account_1.default.findById(session.accountId, { _id: 1 });
    if (!foundAccount)
        return res.status(404).json({ message: "Account not found" });
    const bills = await Bill_1.default.find({ accountId: foundAccount._id })
        .populate("payee", {
        number: 1,
    })
        .lean()
        .exec();
    const getCycleStart = (date, frequency) => {
        const d = new Date(date);
        if (frequency === "monthly") {
            d.setDate(1);
        }
        if (frequency === "quarterly") {
            const quarterStartMonth = Math.floor(d.getMonth() / 3) * 3;
            d.setMonth(quarterStartMonth, 1);
        }
        if (frequency === "yearly") {
            d.setMonth(0, 1);
        }
        d.setHours(0, 0, 0, 0);
        return d;
    };
    const getDueDateForCycle = (now, dueDay, frequency) => {
        const cycleStart = getCycleStart(now, frequency);
        const year = cycleStart.getFullYear();
        const month = cycleStart.getMonth();
        const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
        const day = Math.min(dueDay, lastDayOfMonth);
        return new Date(year, month, day);
    };
    const getFirstValidDueDate = (createdAt, dueDay, frequency) => {
        const base = getDueDateForCycle(createdAt, dueDay, frequency);
        if (base < createdAt) {
            const next = new Date(base);
            if (frequency === "monthly") {
                next.setMonth(next.getMonth() + 1);
            }
            if (frequency === "quarterly") {
                next.setMonth(next.getMonth() + 3);
            }
            if (frequency === "yearly") {
                next.setFullYear(next.getFullYear() + 1);
            }
            return next;
        }
        return base;
    };
    const getCurrentApplicableDueDate = (now, createdAt, dueDay, frequency) => {
        let due = getFirstValidDueDate(createdAt, dueDay, frequency);
        while (true) {
            const next = new Date(due);
            if (frequency === "monthly")
                next.setMonth(next.getMonth() + 1);
            if (frequency === "quarterly")
                next.setMonth(next.getMonth() + 3);
            if (frequency === "yearly")
                next.setFullYear(next.getFullYear() + 1);
            if (next > now)
                break;
            due = next;
        }
        return due;
    };
    const parsedBills = bills.map((bill) => {
        const now = new Date();
        const createdAt = new Date(bill.createdAt);
        const dueDate = getCurrentApplicableDueDate(now, createdAt, bill.dueDay, bill.frequency);
        const lastPayment = bill.lastPayment ? new Date(bill.lastPayment) : null;
        let status;
        if (lastPayment && lastPayment >= dueDate) {
            status = "paid";
        }
        else if (now.getFullYear() === dueDate.getFullYear() &&
            now.getMonth() === dueDate.getMonth() &&
            now.getDate() === dueDate.getDate()) {
            status = "due";
        }
        else if (now > dueDate) {
            status = "overdue";
        }
        else {
            status = "upcoming";
        }
        return {
            ...bill,
            status,
            dueDate,
        };
    });
    res.json({
        message: "Bill created successfully",
        bills: parsedBills,
    });
});
exports.getAccountOrCard = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const session = req.session;
    const foundAccount = await Account_1.default.findById(session.accountId, { _id: 1 });
    if (!foundAccount)
        return res.status(404).json({ message: "Account not found" });
    const { id } = req.params;
    const isAccount = id.length === 8;
    const foundId = isAccount
        ? (await Account_1.default.findOne({ number: id }, { _id: 1 }).lean().exec())?._id
        : (await Card_1.default.findOne({ cardNumber: id, type: "physical" }, { accountId: 1 })
            .lean()
            .exec())?.accountId;
    if (!foundId)
        return res
            .status(404)
            .json({ message: isAccount ? "Account not found" : "Card not found" });
    if (foundAccount._id.toString() === foundId.toString())
        return res.status(409).json({ message: "Cannot transfer to self" });
    res.json({
        message: "Bill created successfully",
        id: foundId,
    });
});
exports.payBill = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const session = req.session;
    const foundAccount = await Account_1.default.findById(session.accountId, { _id: 1 });
    if (!foundAccount)
        return res.status(404).json({ message: "Account not found" });
    const { id } = req.params;
    if (!foundAccount.active)
        return res.status(403).json({ message: "Account blocked" });
    const bill = await Bill_1.default.updateOne({ _id: id }, { lastPayment: new Date() });
    if (!bill.modifiedCount)
        return res.status(404).json({ message: "Bill not found" });
    res.json({
        message: "Bill created successfully",
        payed: id,
    });
});
exports.deleteBill = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const session = req.session;
    const foundAccount = await Account_1.default.findById(session.accountId, { _id: 1 });
    if (!foundAccount)
        return res.status(404).json({ message: "Account not found" });
    const { id } = req.params;
    const bill = await Bill_1.default.deleteOne({ _id: id });
    if (!bill.deletedCount)
        return res.status(404).json({ message: "Bill not found" });
    res.json({
        message: "Bill created successfully",
        deleted: id,
    });
});
//# sourceMappingURL=bill-controller.js.map