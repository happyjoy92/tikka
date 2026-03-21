"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = sendMail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = __importDefault(require("./logger"));
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: 465,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000,
});
async function sendMail({ to, subject, html, }) {
    console.log("Sending mail");
    const info = await transporter.sendMail({
        from: `Tikka <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
    });
    logger_1.default.info("Email sent", { info: info });
    return info;
}
//# sourceMappingURL=email.js.map