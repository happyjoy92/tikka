"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelPaymentRequest = exports.createPaymentRequest = exports.getPaymentRequests = void 0;
const zod_1 = require("zod");
const Request_1 = __importDefault(require("../models/Request"));
const transaction_1 = require("../lib/transaction");
const route_handler_1 = require("../middleware/route-handler");
exports.getPaymentRequests = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const session = req.session;
    const now = new Date();
    const pRequests = await Request_1.default.find({
        accountId: session.accountId,
        $or: [
            { dueDate: { $gte: now } },
            { dueDate: { $exists: false } },
            { dueDate: null },
        ],
    })
        .lean()
        .exec();
    res.status(200).json({
        message: "Load successful",
        requests: pRequests,
    });
});
exports.createPaymentRequest = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const requestSchema = zod_1.z.object({
        amount: zod_1.z.number().min(0),
        description: zod_1.z.string().min(1),
        dueDate: zod_1.z.coerce.date().optional(),
    });
    const session = req.session;
    const parsed = requestSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Invalid request information" });
    const counter = await (0, transaction_1.getTransactionCounter)();
    await (0, transaction_1.incrementTransactionCounter)();
    const pRequest = await Request_1.default.create({
        id: `REQ-${counter}`,
        accountId: session.accountId,
        amount: parsed.data.amount,
        description: parsed.data.description,
        dueDate: parsed.data.dueDate,
        status: "pending",
    });
    res.status(201).json({
        message: "Request created successfully",
        request: pRequest,
    });
});
exports.cancelPaymentRequest = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const session = req.session;
    const { id } = req.params;
    const fRequest = await Request_1.default.deleteOne({
        _id: id,
        accountId: session.accountId,
    })
        .lean()
        .exec();
    if (!fRequest.deletedCount)
        return res.status(404).json({ message: "Request not found" });
    res.status(200).json({
        message: "Request deleted successfully",
        id,
    });
});
//# sourceMappingURL=request-controller.js.map