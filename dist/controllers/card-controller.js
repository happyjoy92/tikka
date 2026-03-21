"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCard = exports.fundCard = exports.updateCard = exports.getCards = exports.getCard = exports.createCard = void 0;
const zod_1 = require("zod");
const card_1 = require("../lib/card");
const Card_1 = __importDefault(require("../models/Card"));
const Account_1 = __importDefault(require("../models/Account"));
const Transaction_1 = require("../models/Transaction");
const transaction_1 = require("../lib/transaction");
const route_handler_1 = require("../middleware/route-handler");
exports.createCard = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const cardSchema = zod_1.z.object({
        type: zod_1.z.enum(["virtual", "physical"], "Invalid card type"),
        issuer: zod_1.z.enum(["Visa", "Mastercard", "Amex", "Discover"], "Invalid card issuer"),
        name: zod_1.z.string().trim().min(2, "Name must be at least 2 characters"),
        limit: zod_1.z.number(),
        autoFreeze: zod_1.z.boolean().default(false),
    });
    const session = req.session;
    const parsed = cardSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Invalid card information" });
    const foundAccount = await Account_1.default.findById(session.accountId, { _id: 1 });
    if (!foundAccount)
        return res.status(404).json({ message: "Account not found" });
    const issuedCardsCount = await Card_1.default.countDocuments({
        accountId: session.accountId,
        status: { $ne: "blocked" },
    });
    if (issuedCardsCount >= 3)
        return res.status(403).json({ message: "Max card amount reached" });
    const generatedCard = (0, card_1.generateCard)(parsed.data.issuer);
    const card = await Card_1.default.create({
        accountId: foundAccount._id,
        active: true,
        type: parsed.data.type,
        name: parsed.data.name,
        autoFreeze: parsed.data.autoFreeze,
        limit: parsed.data.limit,
        issuer: generatedCard.issuer,
        cardNumber: generatedCard.cardNumber,
        cvv: generatedCard.cvv,
        expiration: generatedCard.expiration,
    });
    res.status(201).json({
        message: "Card created successfully",
        card: { id: card._id, name: card.name },
    });
});
exports.getCard = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const codeSchema = zod_1.z.object({
        pincode: zod_1.z
            .string()
            .trim()
            .regex(/^\d{4,6}$/),
    });
    const session = req.session;
    const parsed = codeSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Invalid card data" });
    const { cardId } = req.params;
    const foundAccount = await Account_1.default.findById(session.accountId);
    if (!foundAccount)
        return res.status(404).json({
            message: "Account not found",
        });
    if (foundAccount.pincode !== parsed.data.pincode)
        return res.status(403).json({
            message: "Incorrect pin",
        });
    const foundCard = await Card_1.default.findOne({
        _id: cardId,
        accountId: session.accountId,
    })
        .lean()
        .exec();
    if (!foundCard)
        return res.status(404).json({ message: "Card not found" });
    const safeCard = {
        ...foundCard,
        cardNumber: (0, card_1.formatCardNumber)(foundCard.cardNumber, foundCard.issuer),
    };
    res.json({
        message: "Load successful",
        card: safeCard,
    });
});
exports.getCards = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const session = req.session;
    const foundCards = await Card_1.default.find({ accountId: session.accountId }, { accountId: 0 })
        .lean()
        .exec();
    if (!foundCards)
        return res.status(404).json({ message: "Cards not found" });
    const safeCards = foundCards
        .map((card) => {
        const formatedCardNumber = (0, card_1.formatCardNumber)(card.cardNumber, card.issuer);
        return {
            ...card,
            cardNumber: formatedCardNumber.slice(0, -4).replace(/\d/g, "*") +
                formatedCardNumber.slice(-4),
            cvv: card.cvv.replace(/./g, "*"),
        };
    })
        .sort((a, b) => (a.status === "blocked" ? 0 : a.type === "physical" ? 1 : 2) -
        (b.status === "blocked" ? 0 : b.type === "physical" ? 1 : 2));
    res.json({
        message: "Load successful",
        card: safeCards,
    });
});
exports.updateCard = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const updateSchema = zod_1.z.object({
        status: zod_1.z
            .enum(["active", "blocked", "frozen", "pending", "shipping"])
            .optional(),
        contactless: zod_1.z.boolean().optional(),
        international: zod_1.z.boolean().optional(),
        online: zod_1.z.boolean().optional(),
    });
    const session = req.session;
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Invalid card data" });
    const { cardId } = req.params;
    const updated = await Card_1.default.findOneAndUpdate({ _id: cardId, accountId: session.accountId }, parsed.data)
        .select("type accountId")
        .lean()
        .exec();
    if (!updated)
        return res.status(404).json({ message: "Card not found" });
    if (updated.type === "physical" &&
        parsed.data.status === "frozen" &&
        session.role === "admin") {
        await Account_1.default.updateOne({ _id: updated.accountId }, { active: false });
    }
    if (updated.type === "physical" &&
        parsed.data.status === "active" &&
        session.role === "admin") {
        await Account_1.default.updateOne({ _id: updated.accountId }, { active: true });
    }
    res.json({
        message: "Update successful",
        updated: { _id: cardId, ...parsed.data },
    });
});
exports.fundCard = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
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
        return res.status(400).json({ message: "Invalid card data" });
    const { cardId } = req.params;
    const foundAccount = await Account_1.default.findById(session.accountId);
    const foundCard = await Card_1.default.findOne({
        _id: cardId,
        accountId: session.accountId,
    });
    if (!foundAccount)
        return res.status(404).json({
            message: "Account not found",
        });
    if (!foundCard)
        return res.status(404).json({ message: "Card not found" });
    if (foundCard.type === "physical")
        return res.status(409).json({ message: "Failed to fund physical card" });
    if (foundAccount.pincode !== parsed.data.pincode)
        return res.status(403).json({
            message: "Incorrect pin",
        });
    if (foundAccount.balance < parsed.data.amount)
        return res.status(403).json({
            message: "Insufficient funds",
        });
    foundAccount.balance -= parsed.data.amount;
    foundCard.balance += parsed.data.amount;
    const transactionId = (0, transaction_1.generateTransactionId)(await (0, transaction_1.getTransactionCounter)());
    await (0, transaction_1.incrementTransactionCounter)();
    const transactionRef = (0, transaction_1.generateTransactionReference)();
    const cardTransaction = new Transaction_1.CardTransaction({
        id: transactionId,
        reference: transactionRef,
        accountId: foundAccount._id,
        amount: parsed.data.amount,
        currency: foundAccount.currency,
        status: "completed",
        category: "Deposits",
        mode: "out",
        cardMode: "in",
        cardId: foundCard._id,
        cardNumber: foundCard.cardNumber.slice(-4),
        cardName: foundCard.name,
    });
    await foundAccount.save();
    await foundCard.save();
    await cardTransaction.save();
    res.json({
        message: "Funded card successfully",
        amount: parsed.data.amount,
    });
});
exports.verifyCard = (0, route_handler_1.asyncRoute)(async (req, res) => {
    const verifySchema = zod_1.z.object({
        cardNumber: zod_1.z.string(),
        expiryDate: zod_1.z.string(),
        cvv: zod_1.z.string(),
    });
    const parsed = verifySchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Invalid card data" });
    res.status(404).json({
        message: "Card not found",
    });
});
//# sourceMappingURL=card-controller.js.map