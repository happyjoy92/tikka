"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRates = getRates;
exports.convertCurrency = convertCurrency;
const axios_1 = __importDefault(require("axios"));
const node_cache_1 = __importDefault(require("node-cache"));
const cache = new node_cache_1.default({ stdTTL: 3600 });
const API_URL = "https://api.frankfurter.dev/v1/latest";
const CURRS = ["USD", "EUR"];
async function getRates(base = "USD") {
    const cacheKey = `rates_${base}`;
    const cached = cache.get(cacheKey);
    if (cached)
        return cached;
    try {
        const res = await axios_1.default.get(API_URL, { params: { base } });
        const rates = res.data.rates;
        if (!rates)
            throw new Error("Failed to get rates");
        const filteredRates = Object.fromEntries(Object.entries(rates).filter((entry) => CURRS.includes(entry[0])));
        cache.set(cacheKey, filteredRates);
        return filteredRates;
    }
    catch (err) {
        console.error("Error fetching exchange rates:", err.message);
        throw new Error("Unable to fetch rates at this time");
    }
}
async function convertCurrency({ amount, from, to, }) {
    const rates = await getRates(from);
    const rate = rates[to];
    if (!rate)
        throw new Error(`Currency ${to} not supported`);
    return amount * rate;
}
//# sourceMappingURL=currency.js.map