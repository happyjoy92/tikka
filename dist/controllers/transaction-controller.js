"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSavingTransactions = exports.getCardTransactions = exports.getTransactions = exports.getWeeklyAnalytics = void 0;
const Transaction_1 = require("../models/Transaction");
const zod_1 = require("zod");
const route_handler_1 = require("../middleware/route-handler");
exports.getWeeklyAnalytics = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const session = req.session;
    function getLast7DaysRange(now = new Date(Date.now())) {
        const endOfWeek = new Date(now);
        const startOfWeek = new Date(now);
        startOfWeek.setDate(startOfWeek.getDate() - 6);
        startOfWeek.setHours(0, 0, 0, 0);
        endOfWeek.setHours(23, 59, 59, 999);
        return {
            startOfWeek,
            endOfWeek,
        };
    }
    const { startOfWeek, endOfWeek } = getLast7DaysRange();
    const transactions = await Transaction_1.Transaction.find({
        accountId: session.accountId,
        createdAt: {
            $gte: startOfWeek,
            $lte: endOfWeek,
        },
    })
        .lean()
        .exec();
    const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const totalsByDay = DAYS.map((day) => ({
        day,
        amount: 0,
    }));
    for (const tx of transactions) {
        const dayIndex = new Date(tx.createdAt).getDay();
        totalsByDay[dayIndex].amount += tx.amount;
    }
    const orderedSpending = [
        totalsByDay[1],
        totalsByDay[2],
        totalsByDay[3],
        totalsByDay[4],
        totalsByDay[5],
        totalsByDay[6],
        totalsByDay[0],
    ];
    const categoryBreakdown = {};
    for (const tx of transactions) {
        if (categoryBreakdown[tx.category]) {
            categoryBreakdown[tx.category] = {
                ...categoryBreakdown[tx.category],
                amount: categoryBreakdown[tx.category].amount + tx.amount,
            };
        }
        else {
            categoryBreakdown[tx.category] = {
                category: tx.category,
                amount: tx.amount,
            };
        }
    }
    const parsedCategories = Object.values(categoryBreakdown);
    res.json({
        message: "Load successful",
        analytics: {
            spending: orderedSpending,
            categories: parsedCategories,
        },
    });
});
exports.getTransactions = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const dataPayload = zod_1.z.object({
        start: zod_1.z.coerce.date().nullish(),
        end: zod_1.z.coerce.date().nullish(),
        limit: zod_1.z.coerce.number().min(4).nullish(),
    });
    const session = req.session;
    const parsedPayload = dataPayload.safeParse(req.query);
    if (!parsedPayload.success)
        return res.status(400).json({ message: "Invalid data" });
    const { start, end, limit } = parsedPayload.data;
    const query = {
        accountId: session.accountId,
    };
    if (start || end) {
        query.createdAt = {
            ...(start && { $gte: start }),
            ...(end && { $lte: end }),
        };
    }
    const transactions = await Transaction_1.Transaction.find(query)
        .sort({ createdAt: -1 })
        .populate("sender", "name bank number email phone")
        .populate("recipient", "name bank number email phone")
        .limit(limit ?? 0)
        .lean()
        .exec();
    res.json({
        message: "Load successful",
        transactions,
    });
});
exports.getCardTransactions = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const dataPayload = zod_1.z.object({
        period: zod_1.z.coerce.date().optional(),
        category: zod_1.z
            .enum(["purchases", "refunds", "withdrawals", "top-ups"])
            .optional(),
    });
    const session = req.session;
    const { cardId } = req.params;
    const parsedPayload = dataPayload.safeParse(req.query);
    if (!parsedPayload.success)
        return res.status(400).json({ message: "Invalid data" });
    const query = {
        accountId: session.accountId,
        cardId,
    };
    if (parsedPayload.data.period) {
        query.createdAt = { $gte: parsedPayload.data.period };
    }
    if (parsedPayload.data.category) {
        const categories = parsedPayload.data.category === "top-ups"
            ? ["Deposits"]
            : parsedPayload.data.category === "refunds"
                ? ["Refunds"]
                : parsedPayload.data.category === "withdrawals"
                    ? ["Withdrawals"]
                    : [
                        "Entertainment",
                        "Food & Drink",
                        "Gifts",
                        "Groceries",
                        "Shopping",
                        "Subscriptions",
                        "Travel",
                        "Utilities",
                        "Transportation",
                        "Miscellaneous",
                    ];
        query.category = { $in: categories };
    }
    const transactions = await Transaction_1.CardTransaction.find(query)
        .sort({ createdAt: -1 })
        .lean()
        .exec();
    res.json({
        message: "Load successful",
        transactions,
    });
});
exports.getSavingTransactions = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const session = req.session;
    const { savingId } = req.params;
    const transactions = await Transaction_1.SavingTransaction.find({
        accountId: session.accountId,
        savingId,
    })
        .lean()
        .exec();
    res.json({
        message: "Load successful",
        transactions,
    });
});
//# sourceMappingURL=transaction-controller.js.map