"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.geoCache = void 0;
exports.extractRequestMeta = extractRequestMeta;
const node_cache_1 = __importDefault(require("node-cache"));
exports.geoCache = new node_cache_1.default({
    stdTTL: 60 * 60 * 24,
    checkperiod: 60 * 10,
    useClones: false,
});
function getClientIp(req) {
    const xff = req.headers["x-forwarded-for"];
    if (typeof xff === "string") {
        return xff.split(",")[0].trim();
    }
    return req.socket.remoteAddress;
}
async function lookupGeo(ip) {
    const cacheKey = `geo:${ip}`;
    const cached = exports.geoCache.get(cacheKey);
    if (cached)
        return cached;
    try {
        const res = await fetch(`https://ipinfo.io/${ip}?token=${process.env.IPINFO_TOKEN}`);
        if (!res.ok)
            return null;
        const data = (await res.json());
        exports.geoCache.set(cacheKey, data);
        return data;
    }
    catch {
        return null;
    }
}
async function extractRequestMeta(req) {
    const ua = req.headers["user-agent"]?.toLowerCase() ?? "";
    const deviceType = /mobile|iphone|android/.test(ua)
        ? "phone"
        : ua
            ? "computer"
            : "unknown";
    let platform = "unknown";
    if (/iphone|ipad|ipod/.test(ua))
        platform = "ios";
    else if (/android/.test(ua))
        platform = "android";
    else if (/windows/.test(ua))
        platform = "windows";
    else if (/mac os|macintosh/.test(ua))
        platform = "macos";
    else if (/linux/.test(ua))
        platform = "linux";
    const ip = getClientIp(req);
    const geo = ip ? await lookupGeo(ip) : null;
    let geolocation;
    let address;
    if (geo?.loc) {
        const [lat, lon] = geo.loc.split(",").map(Number);
        if (Number.isFinite(lat) &&
            lat >= -90 &&
            lat <= 90 &&
            Number.isFinite(lon) &&
            lon >= -180 &&
            lon <= 180) {
            geolocation = { lat, lon };
        }
    }
    if (geo?.city && geo?.country) {
        address = `${geo.city}, ${geo.country}`;
    }
    return {
        device: { type: deviceType, platform },
        ...(geolocation && { geolocation }),
        ...(address && { address }),
    };
}
//# sourceMappingURL=geo.js.map