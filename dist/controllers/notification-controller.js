"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.updateNotification = exports.updateNotifications = exports.getNotifications = void 0;
const Notification_1 = require("../models/Notification");
const route_handler_1 = require("../middleware/route-handler");
const zod_1 = require("zod");
const PAGE_SIZE = 30;
exports.getNotifications = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const session = req.session;
    const notifications = await Notification_1.Notification.find({
        accountId: session.accountId,
    })
        .populate("transaction", "amount category mode currency")
        .sort({ createdAt: -1 })
        .limit(PAGE_SIZE)
        .lean()
        .exec();
    res.json({
        message: "Load successful",
        notifications,
    });
});
exports.updateNotifications = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const updateSchema = zod_1.z.object({
        read: zod_1.z.boolean(),
    });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Invalid update information" });
    const session = req.session;
    const updated = await Notification_1.Notification.updateMany({ accountId: session.accountId }, parsed.data)
        .lean()
        .exec();
    if (!updated.matchedCount)
        return res.status(404).json({ message: "Notification not found" });
    res.json({
        message: "Update successful",
        update: parsed.data,
    });
});
exports.updateNotification = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const updateSchema = zod_1.z.object({
        read: zod_1.z.boolean(),
    });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Invalid update information" });
    const session = req.session;
    const { id } = req.params;
    const updated = await Notification_1.Notification.updateOne({ _id: id, accountId: session.accountId }, parsed.data)
        .lean()
        .exec();
    if (!updated.matchedCount)
        return res.status(404).json({ message: "Notification not found" });
    res.json({
        message: "Update successful",
        update: { _id: id, ...parsed.data },
    });
});
exports.deleteNotification = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const session = req.session;
    const { id } = req.params;
    await Notification_1.Notification.deleteOne({
        _id: id,
        accountId: session.accountId,
    })
        .lean()
        .exec();
    res.json({
        message: "Load successful",
        id,
    });
});
//# sourceMappingURL=notification-controller.js.map