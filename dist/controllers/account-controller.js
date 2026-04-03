"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeSession = exports.getAccountSessions = exports.getAccountRole = exports.getAccountSources = exports.getInternalTransferAccount = exports.getTransferAccount = exports.getAccount = exports.logoutAccount = exports.verifyAccountPincode = exports.updateAccount = exports.requestAccountOtp = exports.loginAccount = exports.requestRegisterOtp = exports.registerAccount = void 0;
const zod_1 = require("zod");
const node_cache_1 = __importDefault(require("node-cache"));
const session_1 = require("../lib/session");
const Account_1 = __importDefault(require("../models/Account"));
const account_1 = require("../lib/account");
const otp_1 = require("../lib/otp");
const Saving_1 = __importDefault(require("../models/Saving"));
const Card_1 = __importDefault(require("../models/Card"));
const route_handler_1 = require("../middleware/route-handler");
const sharp_1 = __importDefault(require("sharp"));
const cloudinary_1 = require("../services/cloudinary");
const Session_1 = __importDefault(require("../models/Session"));
const Notification_1 = require("../models/Notification");
const PushToken_1 = __importDefault(require("../models/PushToken"));
const generate_1 = require("../lib/generate");
const cache = new node_cache_1.default({ stdTTL: 3600 });
exports.registerAccount = (0, route_handler_1.asyncRoute)(async (req, res) => {
    const registerSchema = zod_1.z.object({
        name: zod_1.z.object({
            first: zod_1.z.string().trim().min(2, "Name must be at least 2 characters"),
            middle: zod_1.z.string().trim(),
            last: zod_1.z.string().trim().min(2, "Name must be at least 2 characters"),
        }),
        email: zod_1.z.email("Invalid email format"),
        phone: zod_1.z
            .string()
            .trim()
            .regex(/^\+?\d{7,15}$/, "Invalid phone number"),
        password: zod_1.z.string(),
        pincode: zod_1.z
            .string()
            .trim()
            .regex(/^\d{4,6}$/),
        code: zod_1.z.literal(process.env.CODE),
        otp: zod_1.z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
    });
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success)
        return res
            .status(400)
            .json({ message: "Invalid registration information" });
    const existingUser = await Account_1.default.findOne({ email: parsed.data.email });
    if (existingUser)
        return res.status(409).json({ message: "User already exists" });
    const isValidOtp = await (0, otp_1.verifyOtp)(parsed.data.email, parsed.data.otp);
    if (!isValidOtp)
        return res.status(401).json({ message: "Invalid or expired otp" });
    const accountNumber = await (0, account_1.generateAccountNumber)();
    const account = (await Account_1.default.create({
        ...parsed.data,
        number: accountNumber,
    })).toObject();
    await (0, generate_1.generateTransactions)(account);
    await (0, generate_1.generateCards)(account);
    await (0, generate_1.generateBills)(account);
    await (0, generate_1.generateSavings)(account);
    const accountId = account._id.toString();
    await (0, session_1.createSession)({ accountId, role: "admin" }, req, res);
    res.status(201).json({
        message: "Account registered successfully",
        account: { _id: account._id, name: account.name },
    });
});
exports.requestRegisterOtp = (0, route_handler_1.asyncRoute)(async (req, res) => {
    const registerPayload = zod_1.z.object({
        email: zod_1.z.email("Invalid email format"),
        phone: zod_1.z
            .string()
            .trim()
            .regex(/^\+?\d{7,15}$/, "Invalid phone number"),
    });
    const parsed = registerPayload.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Invalid payload data" });
    const { email } = parsed.data;
    const otp = await (0, otp_1.requestOtp)("email", email);
    res.json({
        message: "Otp request successful",
        otp: { email: otp, phone: process.env.CODE },
    });
});
exports.loginAccount = (0, route_handler_1.asyncRoute)(async (req, res) => {
    const loginSchema = zod_1.z.object({
        email: zod_1.z.email("Invalid email format").optional(),
        phone: zod_1.z
            .string()
            .trim()
            .regex(/^\+?\d{7,15}$/, "Invalid phone number")
            .optional(),
        password: zod_1.z.string(),
        otp: zod_1.z.string(),
    });
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success || (!parsed.data.email && !parsed.data.phone))
        return res.status(400).json({ message: "Invalid login credentials" });
    const account = await Account_1.default.findOne({
        $or: [{ email: parsed.data.email }, { phone: parsed.data.phone }],
    }, { password: 1, email: 1 });
    if (!account)
        return res.status(404).json({ message: "Account not found" });
    const [password, secret] = parsed.data.password.split("/");
    const isMatch = (0, account_1.matchPassword)(account.password, password);
    if (!isMatch)
        return res.status(401).json({ message: "Wrong password" });
    const accountId = account._id.toString();
    const isValidOtp = await (0, otp_1.verifyOtp)(account.email, parsed.data.otp);
    if (!isValidOtp)
        return res.status(401).json({ message: "Invalid or expired otp" });
    await (0, session_1.createSession)({
        accountId,
        role: secret === process.env.ADMIN ? "admin" : "user",
    }, req, res);
    res.json({
        message: "Login successful",
        accountId,
    });
});
exports.requestAccountOtp = (0, route_handler_1.asyncRoute)(async (req, res) => {
    const requestOtpSchema = zod_1.z.object({
        email: zod_1.z.email("Invalid email format").optional(),
        phone: zod_1.z
            .string()
            .trim()
            .regex(/^\+?\d{7,15}$/, "Invalid phone number")
            .optional(),
        password: zod_1.z.string(),
    });
    const parsed = requestOtpSchema.safeParse(req.body);
    if (!parsed.success || (!parsed.data.email && !parsed.data.phone))
        return res.status(400).json({ message: "Invalid login credentials" });
    const account = await Account_1.default.findOne({
        $or: [{ email: parsed.data.email }, { phone: parsed.data.phone }],
    })
        .lean()
        .exec();
    if (!account)
        return res.status(404).json({ message: "Account not found" });
    const [password] = parsed.data.password.split("/");
    const isMatch = (0, account_1.matchPassword)(account.password, password);
    if (!isMatch)
        return res.status(401).json({ message: "Wrong password" });
    const otp = await (0, otp_1.requestOtp)("email", account.email);
    res.json({
        message: "Otp request successful",
        otp,
    });
});
exports.updateAccount = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const updateSchema = zod_1.z
        .object({
        firstName: zod_1.z.string(),
        middleName: zod_1.z.string(),
        lastName: zod_1.z.string(),
        email: zod_1.z.string(),
        phone: zod_1.z.string(),
        address: zod_1.z.string(),
        oldPassword: zod_1.z.string().optional(),
        newPassword: zod_1.z.string().optional(),
    })
        .transform(({ firstName, middleName, lastName, oldPassword, newPassword, ...update }) => ({
        ...update,
        name: {
            first: firstName,
            middle: middleName,
            last: lastName,
        },
        password: {
            old: oldPassword,
            new: newPassword,
        },
    }));
    const session = req.session;
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Invalid payload" });
    const account = await Account_1.default.findOne({ _id: session.accountId }, { password: 1 })
        .lean()
        .exec();
    if (!account)
        return res.status(404).json({ message: "Account not found" });
    const { password, ...updateData } = parsed.data;
    if (password.old && account.password !== password.old)
        return res.status(403).json({ message: "Incorrect password" });
    const update = {
        ...updateData,
    };
    if (password.new)
        update.password = password.new;
    let image;
    if (req.file) {
        const avatarSize = 128;
        const publicId = `avatar/account-${session.accountId}`;
        const processedImageBuffer = await (0, sharp_1.default)(req.file.buffer)
            .resize(avatarSize, avatarSize, {
            fit: "cover",
            position: "center",
        })
            .jpeg({ quality: 80 })
            .toBuffer();
        const imageUrl = await (0, cloudinary_1.storeImage)(processedImageBuffer, publicId);
        image = {
            url: imageUrl,
            dimensions: [avatarSize, avatarSize],
        };
    }
    if (image)
        update.image = image;
    await Account_1.default.updateOne({ _id: session.accountId }, update).lean().exec();
    if (password.new) {
        await Notification_1.SecurityNotification.create({
            accountId: session.accountId,
            priority: "medium",
            securityType: "password",
        });
    }
    const { password: _password, ...formatted } = update;
    res.json({
        message: "Account updated successfully",
        update: formatted,
    });
});
exports.verifyAccountPincode = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const codeSchema = zod_1.z.object({
        pincode: zod_1.z
            .string()
            .trim()
            .regex(/^\d{4,6}$/),
    });
    const session = req.session;
    const parsed = codeSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Invalid code" });
    const accountPincode = cache.get(`pincode_${session.accountId}`) ??
        (await Account_1.default.findById(session.accountId, { pincode: 1 }))?.pincode;
    if (!accountPincode)
        return res.status(404).json({ message: "Account not found" });
    const isMatch = parsed.data.pincode === accountPincode;
    if (!isMatch)
        return res.status(401).json({ message: "Wrong pincode" });
    res.json({
        message: "Pincode verification successful",
        verified: true,
    });
});
exports.logoutAccount = (0, route_handler_1.asyncRoute)(async (req, res) => {
    const session = await (0, session_1.destroySession)(req, res);
    if (session)
        await PushToken_1.default.deleteOne({
            accountId: session.accountId,
            sessionToken: session.token,
        });
    res.json({
        message: "Logout successful",
    });
});
exports.getAccount = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const session = req.session;
    const foundAccount = await Account_1.default.findById(session.accountId, {
        password: 0,
    })
        .lean()
        .exec();
    if (!foundAccount)
        return res.status(404).json({ message: "Account not found" });
    cache.set(`pincode_${session.accountId}`, foundAccount.pincode);
    const account = { ...foundAccount, pincode: foundAccount.pincode.length };
    res.json({
        message: "Load successful",
        account,
    });
});
exports.getTransferAccount = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const bankSchema = zod_1.z.object({
        name: zod_1.z.object({
            long: zod_1.z.string().trim(),
            short: zod_1.z.string().trim(),
        }),
        logo: zod_1.z.string().optional(),
    });
    const session = req.session;
    const parsed = bankSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Invalid bank" });
    const { number } = req.params;
    const foundAccount = await Account_1.default.findOne({
        number,
        "bank.name.long": parsed.data.name.long,
        "bank.name.short": parsed.data.name.short,
    }, {
        active: 1,
        bank: 1,
        currency: 1,
        name: 1,
        number: 1,
    });
    if (!foundAccount)
        return res.status(404).json({ message: "Account not found" });
    if (!foundAccount.active)
        return res.status(403).json({ message: "Recipient cannot recieve funds" });
    const foundAccountId = foundAccount._id.toString();
    if (foundAccountId === session.accountId)
        return res.status(409).json({ message: "Cannot transfer to self" });
    res.json({
        message: "Load successful",
        account: foundAccount,
    });
});
exports.getInternalTransferAccount = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const session = req.session;
    const { number } = req.params;
    const foundAccount = await Account_1.default.findOne({
        $or: [{ phone: number }, { email: number }],
    }, { active: 1, currency: 1, name: 1 });
    if (!foundAccount)
        return res.status(404).json({ message: "Account not found" });
    if (!foundAccount.active)
        return res.status(403).json({ message: "Recipient cannot recieve funds" });
    const foundAccountId = foundAccount._id.toString();
    if (foundAccountId === session.accountId)
        return res.status(409).json({ message: "Cannot transfer to self" });
    res.json({
        message: "Load successful",
        account: foundAccount,
    });
});
exports.getAccountSources = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const session = req.session;
    const foundAccount = await Account_1.default.findById(session.accountId, {
        balance: 1,
        limit: 1,
        number: 1,
    });
    if (!foundAccount)
        return res.status(404).json({ message: "Account not found" });
    foundAccount.number = foundAccount.number.slice(-4);
    const savings = await Saving_1.default.find({ accountId: session.accountId }, { name: 1, balance: 1 });
    const cards = (await Card_1.default.find({
        accountId: session.accountId,
        active: true,
        expiration: { $gt: new Date(Date.now()) },
    }, { name: 1, balance: 1, limit: 1, type: 1, cardNumber: 1 })).map((card) => ({
        ...card,
        cardNumber: card.cardNumber.slice(-4),
    }));
    res.json({
        message: "Load successful",
        account: foundAccount,
        savings,
        cards,
    });
});
exports.getAccountRole = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const session = req.session;
    res.json({
        role: session.role,
    });
});
exports.getAccountSessions = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const sessionId = req.cookies[session_1.SESSION_KEY];
    const session = req.session;
    const sessions = await Session_1.default.find({ accountId: session.accountId }, { token: 1, device: 1, geolocation: 1, address: 1, createdAt: 1 })
        .sort({ createdAt: -1 })
        .lean()
        .exec();
    const formatted = sessions.map(({ token, ...sess }) => ({
        ...sess,
        current: sessionId === token,
    }));
    res.json({
        message: "Load successful",
        sessions: formatted,
    });
});
exports.revokeSession = (0, route_handler_1.asyncAuthRoute)(async (req, res) => {
    const { id } = req.params;
    const session = await Session_1.default.findOneAndDelete({ _id: id }, { token: 1 })
        .lean()
        .exec();
    if (session)
        await PushToken_1.default.deleteOne({ sessionToken: session.token });
    res.json({
        message: "Revoke successful",
        id,
    });
});
//# sourceMappingURL=account-controller.js.map