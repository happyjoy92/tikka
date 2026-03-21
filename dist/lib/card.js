"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVisaCard = generateVisaCard;
exports.generateMastercard = generateMastercard;
exports.generateAmex = generateAmex;
exports.generateDiscover = generateDiscover;
exports.generateCard = generateCard;
exports.formatCardNumber = formatCardNumber;
const crypto_1 = __importDefault(require("crypto"));
function getRandomInt(min, max) {
    return crypto_1.default.randomInt(min, max + 1);
}
function getLuhnCheckDigit(cardNumber) {
    let sum = 0;
    for (let i = 0; i < cardNumber.length; i++) {
        let digit = parseInt(cardNumber[cardNumber.length - 1 - i], 10);
        if (i % 2 === 0) {
            digit *= 2;
            if (digit > 9)
                digit -= 9;
        }
        sum += digit;
    }
    return (10 - (sum % 10)) % 10;
}
function generateExpiration() {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 2);
    return d;
}
function buildAccountNumber(accountIdentifier, length) {
    return (accountIdentifier?.padStart(length, "0") ||
        Array.from({ length }, () => getRandomInt(0, 9)).join(""));
}
function generateVisaCard(accountIdentifier) {
    const IIN = "4";
    const bankIdentifier = "53821";
    const accountNumber = buildAccountNumber(accountIdentifier, 9);
    const base = IIN + bankIdentifier + accountNumber;
    const cardNumber = base + getLuhnCheckDigit(base);
    return {
        cardNumber,
        cvv: getRandomInt(100, 999).toString(),
        expiration: generateExpiration(),
        issuer: "Visa",
    };
}
function generateMastercard(accountIdentifier) {
    const IIN = "51";
    const bankIdentifier = "98214";
    const accountNumber = buildAccountNumber(accountIdentifier, 8);
    const base = IIN + bankIdentifier + accountNumber;
    const cardNumber = base + getLuhnCheckDigit(base);
    return {
        cardNumber,
        cvv: getRandomInt(100, 999).toString(),
        expiration: generateExpiration(),
        issuer: "Mastercard",
    };
}
function generateAmex(accountIdentifier) {
    const IIN = "37";
    const bankIdentifier = "2849";
    const accountNumber = buildAccountNumber(accountIdentifier, 7);
    const base = IIN + bankIdentifier + accountNumber;
    const cardNumber = base + getLuhnCheckDigit(base);
    return {
        cardNumber,
        cvv: getRandomInt(1000, 9999).toString(),
        expiration: generateExpiration(),
        issuer: "Amex",
    };
}
function generateDiscover(accountIdentifier) {
    const IIN = "6011";
    const bankIdentifier = "3921";
    const accountNumber = buildAccountNumber(accountIdentifier, 7);
    const base = IIN + bankIdentifier + accountNumber;
    const cardNumber = base + getLuhnCheckDigit(base);
    return {
        cardNumber,
        cvv: getRandomInt(100, 999).toString(),
        expiration: generateExpiration(),
        issuer: "Discover",
    };
}
function generateCard(type, accountIdentifier) {
    switch (type) {
        case "Visa":
            return generateVisaCard(accountIdentifier);
        case "Mastercard":
            return generateMastercard(accountIdentifier);
        case "Amex":
            return generateAmex(accountIdentifier);
        case "Discover":
            return generateDiscover(accountIdentifier);
        default:
            throw new Error("Unsupported card type");
    }
}
function formatCardNumber(cardNumber, cardType) {
    const digits = String(cardNumber).replace(/\D/g, "");
    switch (cardType) {
        case "Amex": {
            return digits.replace(/^(\d{0,4})(\d{0,6})(\d{0,5}).*/, (_, a, b, c) => [a, b, c].filter(Boolean).join(" "));
        }
        case "Visa":
        case "Mastercard":
        case "Discover":
        default: {
            return digits.replace(/(.{4})/g, "$1 ").trim();
        }
    }
}
//# sourceMappingURL=card.js.map