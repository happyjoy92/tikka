"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const imageSchema = new mongoose_1.default.Schema({
    url: {
        type: String,
        required: true,
    },
    dimensions: {
        type: [Number, Number],
        required: true,
    },
}, { _id: false });
const nameSchema = new mongoose_1.default.Schema({
    first: {
        type: String,
        required: true,
        trim: true,
    },
    middle: {
        type: String,
        trim: true,
        default: "",
    },
    last: {
        type: String,
        required: true,
        trim: true,
    },
}, { _id: false });
const bankSchema = new mongoose_1.default.Schema({
    name: {
        long: {
            type: String,
            required: true,
        },
        short: {
            type: String,
            required: true,
        },
    },
    logo: {
        type: String,
        required: true,
    },
    colorTheme: {
        type: String,
        required: true,
    },
}, { _id: false });
const accountSchema = new mongoose_1.default.Schema({
    image: imageSchema,
    name: {
        type: nameSchema,
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ["system", "checking"],
        default: "checking",
        index: true,
    },
    bank: {
        type: bankSchema,
        default: {
            name: {
                long: "Tikka Bank",
                short: "Tikka",
            },
            logo: "/assets/tikka-bank-logo.png",
            colorTheme: "#298BEA",
        },
    },
    active: {
        type: Boolean,
        default: true,
    },
    verified: {
        type: Boolean,
        default: true,
    },
    limit: {
        type: Number,
        default: 500000,
    },
    balance: {
        type: Number,
        required: true,
        default: 0,
    },
    currency: {
        type: String,
        required: true,
        enum: ["USD", "EUR"],
        default: "USD",
    },
    number: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^\+?\d{7,15}$/.test(v);
            },
            message: (props) => `${props.value} is not a valid phone number!`,
        },
    },
    address: {
        type: String,
        trim: true,
        default: "77 Rue du Landy, 93200 Saint-Denis, Seine-Saint-Denis, France",
    },
    document: {
        type: String,
        enum: ["passport", "dl"],
        default: "passport",
    },
    password: {
        type: String,
        required: true,
    },
    pincode: {
        type: String,
        required: true,
        match: [/^\d{4,6}$/, "Pincode must be 4 or 6 digits"],
    },
}, { timestamps: true });
const Account = mongoose_1.default.model("Account", accountSchema);
exports.default = Account;
//# sourceMappingURL=Account.js.map