"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrencyRates = exports.requestTransferOtp = exports.getTransfers = exports.sendMoney = void 0;
const zod_1 = require("zod");
const Account_1 = __importDefault(require("../models/Account"));
const currency_1 = require("../lib/currency");
const otp_1 = require("../lib/otp");
const Card_1 = __importDefault(require("../models/Card"));
const Saving_1 = __importDefault(require("../models/Saving"));
const transaction_1 = require("../lib/transaction");
const Transaction_1 = require("../models/Transaction");
const route_handler_1 = require("../middleware/route-handler");
const Notification_1 = require("../models/Notification");
const PAGE_SIZE = 30;
exports.sendMoney = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const transferSchema = zod_1.z.object({
        type: zod_1.z.literal(["email", "phone", "bank"]),
        currency: zod_1.z.literal(["USD", "EUR"]),
        source: zod_1.z.object({
            tag: zod_1.z.literal(["account", "card", "saving"]),
            id: zod_1.z.string().trim(),
        }),
        speed: zod_1.z.literal(["instant", "scheduled"]),
        scheduledDate: zod_1.z.coerce.date().optional(),
        amount: zod_1.z.number().min(0.1),
        fee: zod_1.z.number().min(0),
        description: zod_1.z.string().trim(),
        pincode: zod_1.z
            .string()
            .trim()
            .regex(/^\d{4,6}$/),
        otp: zod_1.z.string().trim(),
    });
    const session = req.session;
    const parsedTransfer = transferSchema.safeParse(req.body);
    if (!parsedTransfer.success)
        return res.status(400).json({ message: "Missing transaction fields" });
    if (parsedTransfer.data.speed === "scheduled" &&
        !parsedTransfer.data.scheduledDate)
        return res
            .status(400)
            .json({ message: "Missing scheduled transaction fields" });
    const senderAccount = await Account_1.default.findById(session.accountId);
    let recipientAccount;
    if (parsedTransfer.data.type === "email" ||
        parsedTransfer.data.type === "phone") {
        const contactTransferSchema = transferSchema.extend({
            phoneOrEmail: zod_1.z.string().trim(),
        });
        const parsedContactTransfer = contactTransferSchema.safeParse(req.body);
        if (!parsedContactTransfer.success)
            return res
                .status(400)
                .json({ message: "Missing contact transaction fields" });
        recipientAccount = await Account_1.default.findOne({
            $or: [
                { phone: parsedContactTransfer.data.phoneOrEmail },
                { email: parsedContactTransfer.data.phoneOrEmail },
            ],
        });
    }
    else {
        const bankTransferSchema = transferSchema.extend({
            accountNumber: zod_1.z.string().trim(),
            bank: zod_1.z.object({
                name: zod_1.z.object({
                    short: zod_1.z.string(),
                    long: zod_1.z.string(),
                }),
                logo: zod_1.z.string().optional(),
                colorTheme: zod_1.z.string().optional(),
            }),
        });
        const parsedBankTransfer = bankTransferSchema.safeParse(req.body);
        if (!parsedBankTransfer.success)
            return res
                .status(400)
                .json({ message: "Missing bank transaction fields" });
        recipientAccount = await Account_1.default.findOne({
            number: parsedBankTransfer.data.accountNumber,
        });
    }
    if (!senderAccount)
        return res.status(404).json({
            message: "Sender not found",
        });
    if (!senderAccount.active)
        return res.status(403).json({ message: "Account blocked" });
    if (senderAccount.pincode !== parsedTransfer.data.pincode)
        return res.status(403).json({
            message: "Incorrect pin",
        });
    if (parsedTransfer.data.amount > 1000) {
        const verified = await (0, otp_1.verifyOtp)(senderAccount.email, parsedTransfer.data.otp);
        if (!verified)
            return res.status(403).json({
                message: "Incorrect otp",
            });
    }
    const debitAmount = parsedTransfer.data.currency === senderAccount.currency
        ? parsedTransfer.data.amount
        : await (0, currency_1.convertCurrency)({
            amount: parsedTransfer.data.amount,
            from: parsedTransfer.data.currency,
            to: senderAccount.currency,
        });
    const totalDebitAmount = debitAmount + parsedTransfer.data.fee;
    let source;
    if (parsedTransfer.data.source.tag === "account") {
        const sourceAccount = senderAccount._id.toString() === parsedTransfer.data.source.id
            ? senderAccount
            : await Account_1.default.findById(parsedTransfer.data.source.id);
        if (!sourceAccount)
            return res.status(404).json({
                message: "Source account not found",
            });
        sourceAccount.balance = Number.parseFloat((sourceAccount.balance - totalDebitAmount).toFixed(2));
        source = sourceAccount;
    }
    else if (parsedTransfer.data.source.tag === "card") {
        const sourceCard = await Card_1.default.findById(parsedTransfer.data.source.id);
        if (!sourceCard)
            return res.status(404).json({
                message: "Source card not found",
            });
        sourceCard.balance = Number.parseFloat((sourceCard.balance - totalDebitAmount).toFixed());
        source = sourceCard;
    }
    else if (parsedTransfer.data.source.tag === "saving") {
        const sourceSaving = await Saving_1.default.findById(parsedTransfer.data.source.id);
        if (!sourceSaving)
            return res.status(404).json({
                message: "Source saving not found",
            });
        sourceSaving.balance = Number.parseFloat((sourceSaving.balance - totalDebitAmount).toFixed(2));
        source = sourceSaving;
    }
    else {
        return res.status(400).json({
            message: "Invalid account source",
        });
    }
    if (source.balance < 0)
        return res.status(403).json({
            message: "Insufficient funds",
        });
    if (!recipientAccount)
        return res.status(404).json({
            message: "Recipient not found",
        });
    const creditAmount = parsedTransfer.data.currency === recipientAccount.currency
        ? parsedTransfer.data.amount
        : await (0, currency_1.convertCurrency)({
            amount: parsedTransfer.data.amount,
            from: parsedTransfer.data.currency,
            to: recipientAccount.currency,
        });
    recipientAccount.balance = Number.parseFloat((recipientAccount.balance + creditAmount).toFixed(2));
    if (recipientAccount.balance > 100000000000)
        return res
            .status(403)
            .json({ message: "Max amount reached for recipient" });
    const counter = await (0, transaction_1.getTransactionCounter)();
    const sTransactionId = (0, transaction_1.generateTransactionId)(counter);
    const rTransactionId = (0, transaction_1.generateTransactionId)(counter + transaction_1.incrementBy);
    const transactionRef = (0, transaction_1.generateTransactionReference)();
    await (0, transaction_1.incrementTransactionCounter)(parsedTransfer.data.speed === "instant" ? 2 : 1);
    const sentTransaction = new Transaction_1.TransferTransaction({
        id: sTransactionId,
        reference: transactionRef,
        accountId: senderAccount._id,
        amount: parsedTransfer.data.amount,
        fee: parsedTransfer.data.fee,
        currency: parsedTransfer.data.currency,
        status: parsedTransfer.data.speed === "instant" ? "completed" : "pending",
        mode: "out",
        description: parsedTransfer.data.description,
        category: "Miscellaneous",
        recipient: recipientAccount._id,
        transferType: parsedTransfer.data.type,
        speed: parsedTransfer.data.speed,
        source: parsedTransfer.data.source,
        scheduledDate: parsedTransfer.data.scheduledDate,
    });
    let recipientTransaction;
    if (parsedTransfer.data.speed === "instant") {
        recipientTransaction = new Transaction_1.DepositTransaction({
            id: rTransactionId,
            reference: transactionRef,
            accountId: recipientAccount._id,
            amount: parsedTransfer.data.amount,
            fee: parsedTransfer.data.fee,
            currency: parsedTransfer.data.currency,
            status: "completed",
            mode: "in",
            description: parsedTransfer.data.description,
            category: "Deposits",
            sender: senderAccount._id,
            depositType: parsedTransfer.data.type,
        });
    }
    if (parsedTransfer.data.speed === "instant") {
        await source.save();
        await recipientAccount.save();
    }
    await sentTransaction.save();
    if (recipientTransaction)
        await recipientTransaction.save();
    const transaction = {
        ...sentTransaction.toObject(),
        sender: {
            accountNumber: senderAccount.number,
            name: senderAccount.name,
            bank: senderAccount.bank,
        },
        recipient: {
            accountNumber: recipientAccount.number,
            name: recipientAccount.name,
            bank: recipientAccount.bank,
        },
    };
    await Notification_1.TransactionNotification.create({
        accountId: sentTransaction.accountId,
        priority: "low",
        transaction: sentTransaction._id,
    });
    if (recipientTransaction) {
        await Notification_1.TransactionNotification.create({
            accountId: recipientTransaction.accountId,
            priority: "low",
            transaction: recipientTransaction._id,
        });
    }
    res.json({
        message: "Send successful",
        transaction,
    });
});
exports.getTransfers = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const session = req.session;
    const transfers = (await Transaction_1.TransferTransaction.find({
        accountId: session.accountId,
        transferType: { $in: ["email", "phone", "bank"] },
    }, { transferType: 1, recipient: 1 })
        .sort({ createdAt: -1 })
        .limit(PAGE_SIZE)
        .populate("recipient", "name phone email number bank image")
        .lean()
        .exec());
    const contactTransfers = [];
    const bankTransfers = [];
    const allTransfers = [];
    transfers.forEach((transfer) => {
        if (transfer.transferType === "phone" &&
            !contactTransfers.find((ct) => ct.phone === transfer.recipient.phone)) {
            const formatted = {
                type: "phone",
                image: transfer.recipient.image,
                name: transfer.recipient.name,
                phone: transfer.recipient.phone,
            };
            contactTransfers.push(formatted);
            allTransfers.push(formatted);
        }
        else if (transfer.transferType === "email" &&
            !contactTransfers.find((ct) => ct.email === transfer.recipient.email)) {
            const formatted = {
                type: "email",
                image: transfer.recipient.image,
                name: transfer.recipient.name,
                email: transfer.recipient.email,
            };
            contactTransfers.push(formatted);
            allTransfers.push(formatted);
        }
        if (transfer.transferType === "bank" &&
            !bankTransfers.find((t) => t.name === transfer.recipient.name &&
                t.bank?.name?.long === transfer.recipient.bank?.name?.long)) {
            const formatted = {
                type: "bank",
                number: transfer.recipient.number,
                name: transfer.recipient.name,
                bank: transfer.recipient.bank,
            };
            bankTransfers.push(formatted);
            allTransfers.push(formatted);
        }
    });
    res.json({
        message: "Load successful",
        transfers: allTransfers,
    });
});
exports.requestTransferOtp = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const { accountId } = req.session;
    const account = await Account_1.default.findById(accountId).lean().exec();
    if (!account)
        return res.status(404).json({ message: "Account not found" });
    await (0, otp_1.requestOtp)("email", account.email);
    res.json({
        message: "Otp request successful",
    });
});
exports.getCurrencyRates = (0, route_handler_1.asyncRoute)(async (req, res) => {
    const rates = await (0, currency_1.getRates)();
    res.json({ message: "Load successful", rates });
});
//# sourceMappingURL=transfer-controller.js.map