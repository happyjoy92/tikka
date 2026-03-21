"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPopularBanks = exports.getBanks = exports.bankLookup = void 0;
const Account_1 = __importDefault(require("../models/Account"));
const route_handler_1 = require("../middleware/route-handler");
exports.bankLookup = (0, route_handler_1.asyncRoute)(async (req, res) => {
    const { number } = req.params;
    const foundAccount = await Account_1.default.findOne({ number }, { bank: 1 });
    if (!foundAccount || !foundAccount.bank)
        return res.status(404).json({ message: "Bank not found" });
    res.json({
        message: "Load successful",
        bank: foundAccount.bank,
    });
});
exports.getBanks = (0, route_handler_1.asyncRoute)(async (req, res) => {
    const { default: banks } = await Promise.resolve().then(() => __importStar(require("../data/banks.json")));
    const bankList = [];
    for (const bank of banks) {
        if (bankList.length &&
            bankList.find((b) => b.name.short === bank.name.short))
            continue;
        else
            bankList.push(bank);
    }
    res.json({
        message: "Load successful",
        banks: bankList,
    });
});
exports.getPopularBanks = (0, route_handler_1.asyncRoute)(async (req, res) => {
    const { default: banks } = await Promise.resolve().then(() => __importStar(require("../data/banks.json")));
    res.json({
        message: "Load successful",
        banks: banks.slice(0, 10),
    });
});
//# sourceMappingURL=bank-controller.js.map