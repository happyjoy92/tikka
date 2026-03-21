"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUsers = generateUsers;
exports.generateTransactionRecords = generateTransactionRecords;
exports.generateGoals = generateGoals;
exports.generateBillRecords = generateBillRecords;
const banks_json_1 = __importDefault(require("../data/banks.json"));
const firstNames = [
    "Lucas",
    "Lucas",
    "Lucas",
    "Hugo",
    "Hugo",
    "Hugo",
    "Nathan",
    "Nathan",
    "Enzo",
    "Enzo",
    "Louis",
    "Louis",
    "Gabriel",
    "Gabriel",
    "Arthur",
    "Arthur",
    "Adam",
    "Adam",
    "Jules",
    "Léo",
    "Paul",
    "Noah",
    "Raphaël",
    "Clara",
    "Clara",
    "Emma",
    "Emma",
    "Emma",
    "Léa",
    "Léa",
    "Chloé",
    "Chloé",
    "Manon",
    "Camille",
    "Lucie",
    "Julie",
    "Sarah",
    "Inès",
    "Eva",
    "Alice",
    "Sofia",
    "Yanis",
    "Karim",
    "Amina",
    "Leila",
    "Samir",
    "Moussa",
    "Fatou",
    "Omar",
    "Samuel",
    "David",
    "Rachel",
    "Noah",
    "Kevin",
    "Minh",
    "Linh",
];
const middleNames = [
    "Marie",
    "Jean",
    "Paul",
    "Anne",
    "Claire",
    "Louis",
    "Alexandre",
    "Marc",
    "Louise",
    "Sophie",
];
const lastNames = [
    "Martin",
    "Martin",
    "Martin",
    "Bernard",
    "Bernard",
    "Thomas",
    "Thomas",
    "Petit",
    "Petit",
    "Robert",
    "Richard",
    "Durand",
    "Dubois",
    "Moreau",
    "Laurent",
    "Simon",
    "Michel",
    "Lefebvre",
    "Leroy",
    "Roux",
    "David",
    "Bertrand",
    "Morel",
    "Fournier",
    "Girard",
    "Andre",
    "Mercier",
    "Lambert",
    "Bonnet",
    "Francois",
    "Legrand",
    "Garnier",
    "Faure",
    "Renaud",
    "Marchand",
    "Blanc",
    "Henry",
    "Roussel",
    "Perrin",
    "Boyer",
    "Giraud",
    "Renard",
    "Lemoine",
    "Barbier",
    "Gaillard",
    "Leclerc",
    "Meyer",
    "Delorme",
    "Bensalem",
    "Belkacem",
    "Mokhtari",
    "Diallo",
    "Traoré",
    "Konaté",
    "Sarr",
    "Fernandes",
    "DaSilva",
    "Navarro",
    "Morales",
    "Pinto",
    "Ortega",
    "Weiss",
    "Benhamou",
    "Klein",
    "Nguyen",
    "Tran",
    "Pham",
    "Hoang",
    "Le",
];
const streets = [
    "Rue Victor Hugo",
    "Rue de la République",
    "Rue Pasteur",
    "Rue Voltaire",
    "Rue Nationale",
    "Rue des Lilas",
    "Rue des Écoles",
    "Rue Jean Jaurès",
    "Rue de Paris",
    "Rue Gambetta",
];
const cities = [
    { city: "Paris", postal: "750" },
    { city: "Lyon", postal: "690" },
    { city: "Marseille", postal: "130" },
    { city: "Toulouse", postal: "310" },
    { city: "Nice", postal: "060" },
    { city: "Nantes", postal: "440" },
    { city: "Bordeaux", postal: "330" },
    { city: "Lille", postal: "590" },
    { city: "Strasbourg", postal: "670" },
    { city: "Montpellier", postal: "340" },
];
const emailDomains = [
    "gmail.com",
    "hotmail.fr",
    "outlook.fr",
    "yahoo.fr",
    "orange.fr",
    "icloud.com",
];
const usedEmails = new Set();
function randd(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function randdInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function generateName() {
    const first = randd(firstNames);
    const last = randd(lastNames);
    const middle = Math.random() < 0.35 ? randd(middleNames) : "";
    return { first, middle, last };
}
function generatePhone() {
    const prefix = Math.random() < 0.5 ? "06" : "07";
    const parts = [prefix];
    for (let i = 0; i < 4; i++) {
        parts.push(String(randdInt(0, 99)).padStart(2, "0"));
    }
    return parts.join("");
}
function nickname(first) {
    const f = first.toLowerCase();
    const variants = [
        f,
        f.slice(0, 3),
        f.slice(0, 4),
        f.slice(0, 2) + f.slice(-2),
    ];
    return randd(variants);
}
function generateEmail(name) {
    const first = name.first.toLowerCase();
    const last = name.last.toLowerCase();
    while (true) {
        const nick = nickname(first);
        const initial = first[0];
        const year = randdInt(75, 2005);
        const small = randdInt(1, 99);
        const patterns = [
            `${first}.${last}`,
            `${nick}.${last}`,
            `${nick}${last}`,
            `${initial}${last}`,
            `${nick}_${last}`,
            `${nick}${year}`,
            `${first}${small}`,
            `${nick}.${last}${small}`,
            `${initial}.${last}${year}`,
        ];
        const username = randd(patterns);
        const domain = randd(emailDomains);
        const email = `${username}@${domain}`;
        if (!usedEmails.has(email)) {
            usedEmails.add(email);
            return email;
        }
    }
}
function generateAddress() {
    const number = randdInt(1, 150);
    const street = randd(streets);
    const location = randd(cities);
    const postal = location.postal + randdInt(10, 99);
    return `${number} ${street}, ${postal} ${location.city}`;
}
function selectBank() {
    const index = Math.floor(Math.random() * banks_json_1.default.length);
    return banks_json_1.default[index];
}
function generateUser() {
    const name = generateName();
    return {
        name,
        phone: generatePhone(),
        email: generateEmail(name),
        address: generateAddress(),
        bank: selectBank(),
    };
}
function generateUsers(count) {
    const users = [];
    for (let i = 0; i < count; i++) {
        users.push(generateUser());
    }
    return users;
}
function generateTransactionRecords(count, year = new Date().getFullYear()) {
    const history = simulateYear(year);
    history.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return history.slice(0, count);
}
function simulateYear(year) {
    const tx = [];
    const start = new Date(year, 0, 1);
    const end = new Date(Date.now());
    const salary = round2(rand(2800, 1250000));
    const rent = round2(rand(900, 200000));
    const subscriptions = [
        round2(rand(60, 15000)),
        round2(rand(50, 12000)),
        round2(rand(100, 25000)),
    ];
    for (let m = 0; m < 12; m++) {
        const monthDate = new Date(year, m, 1);
        tx.push({
            createdAt: setTime(new Date(year, m, randInt(25, 28)), randInt(6, 9)),
            amount: salary,
            mode: "in",
            category: "Income",
        });
        tx.push({
            createdAt: setTime(new Date(year, m, randInt(1, 5)), randInt(8, 11)),
            amount: rent,
            mode: "out",
            category: "Housing",
        });
        tx.push({
            createdAt: setTime(new Date(year, m, randInt(10, 15)), randInt(8, 12)),
            amount: round2(rand(800, 2500)),
            mode: "out",
            category: "Utilities",
        });
        for (const sub of subscriptions) {
            tx.push({
                createdAt: setTime(new Date(year, m, randInt(2, 25)), randInt(0, 3)),
                amount: sub,
                mode: "out",
                category: "Subscriptions",
            });
        }
        tx.push({
            createdAt: setTime(new Date(year, m, randInt(27, 28)), randInt(1, 3)),
            amount: round2(rand(100, 2000)),
            mode: "in",
            category: "Interests",
        });
    }
    let cursor = new Date(start);
    while (cursor <= end) {
        const weekday = cursor.getDay();
        let dailyCount = 0;
        if (weekday === 6)
            dailyCount = randInt(1, 5);
        else if (weekday === 0)
            dailyCount = randInt(0, 3);
        else
            dailyCount = randInt(0, 3);
        for (let i = 0; i < dailyCount; i++) {
            const category = pickSpendingCategory(cursor.getMonth());
            const { amount, mode } = categoryBehavior(category);
            const date = new Date(cursor);
            date.setHours(randInt(7, 22), randInt(0, 59), randInt(0, 59));
            tx.push({
                createdAt: date,
                amount,
                mode,
                category,
            });
        }
        cursor.setDate(cursor.getDate() + 1);
    }
    for (let i = 0; i < randInt(2, 5); i++) {
        tx.push({
            createdAt: randomDate(start, end),
            amount: round2(rand(1000, 150000)),
            mode: "in",
            category: "Refunds",
        });
    }
    for (let i = 0; i < randInt(2, 4); i++) {
        tx.push({
            createdAt: randomDate(start, end),
            amount: round2(rand(2000, 18000)),
            mode: "out",
            category: "Travel",
        });
    }
    for (let i = 0; i < randInt(6, 12); i++) {
        tx.push({
            createdAt: randomDate(start, end),
            amount: round2(rand(2000, 40000)),
            mode: "out",
            category: "Withdrawals",
        });
    }
    return tx.map((t) => ({ ...t, fee: t.amount >= 1000 ? 2.5 : 0 }));
}
function pickSpendingCategory(month) {
    const r = Math.random();
    if (r < 0.3)
        return "Food & Drink";
    if (r < 0.45)
        return "Groceries";
    if (r < 0.58)
        return "Transportation";
    if (r < 0.7)
        return "Shopping";
    if (r < 0.82)
        return "Entertainment";
    if (r < 0.9)
        return "Miscellaneous";
    if (r < 0.95)
        return "Healthcare";
    return "Fees";
}
function categoryBehavior(category) {
    switch (category) {
        case "Food & Drink":
            return { amount: round2(rand(500, 4000)), mode: "out" };
        case "Groceries":
            return { amount: round2(rand(400, 1800)), mode: "out" };
        case "Transportation":
            return { amount: round2(rand(30, 350)), mode: "out" };
        case "Shopping":
            return { amount: round2(rand(250, 4500)), mode: "out" };
        case "Entertainment":
            return { amount: round2(rand(25, 150)), mode: "out" };
        case "Healthcare":
            return { amount: round2(rand(400, 3500)), mode: "out" };
        case "Fees":
            return { amount: round2(rand(5, 25)), mode: "out" };
        case "Miscellaneous":
            return {
                amount: round2(rand(500, 2000)),
                mode: Math.random() < 0.2 ? "in" : "out",
            };
        default:
            return { amount: round2(rand(100, 1000)), mode: "out" };
    }
}
function rand(min, max) {
    return Math.random() * (max - min) + min;
}
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function round2(n) {
    return Math.round(n * 100) / 100;
}
function setTime(createdAt, hour) {
    const d = new Date(createdAt);
    d.setHours(hour);
    d.setMinutes(randInt(0, 59));
    d.setSeconds(randInt(0, 59));
    return d;
}
function randomDate(start, end) {
    const t = rand(start.getTime(), end.getTime());
    const d = new Date(t);
    d.setHours(randInt(6, 23), randInt(0, 59), randInt(0, 59));
    return d;
}
function generateGoals() {
    const categories = [
        "emergency",
        "vacation",
        "purchase",
        "education",
        "home",
        "other",
    ];
    const goalCount = randInt(3, 4);
    const selected = [];
    const usedCategories = new Set();
    const usedNames = new Set();
    const now = new Date();
    const past = new Date();
    past.setFullYear(now.getFullYear() - 1);
    const future = new Date();
    future.setFullYear(now.getFullYear() + 1);
    for (let i = 0; i < goalCount; i++) {
        let category;
        do {
            category = categories[randInt(0, categories.length - 1)];
        } while (usedCategories.has(category));
        usedCategories.add(category);
        const name = generateUniqueName(category, usedNames);
        let amount = 0;
        let autoSave = 0;
        switch (category) {
            case "emergency":
                amount = round2(rand(500, 5000));
                autoSave = round2(amount / 12);
                break;
            case "vacation":
                amount = round2(rand(800, 5000));
                autoSave = round2(amount / 12);
                break;
            case "purchase":
                amount = round2(rand(200, 2000));
                autoSave = 0;
                break;
            case "education":
                amount = round2(rand(300, 2500));
                autoSave = round2(amount / 12);
                break;
            case "home":
                amount = round2(rand(500, 8000));
                autoSave = round2(amount / 12);
                break;
            case "other":
                amount = round2(rand(100, 1500));
                autoSave = 0;
                break;
        }
        const deadline = randomZeroDate(past, future);
        const balance = round2(rand(0, amount / 2));
        selected.push({
            name,
            category,
            balance,
            autoSave,
            target: {
                amount,
                date: deadline,
            },
            roundUp: Math.random() < 0.5,
        });
    }
    console.log(selected.slice(0, 3));
    return selected;
}
function generateUniqueName(category, used) {
    const namesByCategory = {
        emergency: ["Emergency Fund", "Rainy Day Fund", "Safety Net"],
        vacation: [
            "Summer Vacation",
            "Dubai Trip",
            "Beach Getaway",
            "Holiday Trip",
        ],
        purchase: ["New Phone", "Laptop Upgrade", "Gaming Setup"],
        education: ["Online Courses", "Certification Fund", "Bootcamp Tuition"],
        home: ["Rent Savings", "Furniture Fund", "Home Setup"],
        other: ["Side Project", "Personal Goal", "Misc Savings"],
    };
    const pool = namesByCategory[category];
    let name = pool[randInt(0, pool.length - 1)];
    while (used.has(name)) {
        name = pool[randInt(0, pool.length - 1)];
    }
    used.add(name);
    return name;
}
function randomZeroDate(start, end) {
    const t = rand(start.getTime(), end.getTime());
    const d = new Date(t);
    d.setHours(randInt(0, 23), randInt(0, 59), randInt(0, 59));
    return d;
}
function generateBillRecords() {
    const types = [
        "utility",
        "subscription",
        "loan",
        "insurance",
        "other",
    ];
    const frequencyOptions = [
        "monthly",
        "quarterly",
        "yearly",
    ];
    const billCount = randInt(5, 8);
    const bills = [];
    const usedNames = new Set();
    for (let i = 0; i < billCount; i++) {
        const type = types[randInt(0, types.length - 1)];
        let name = pickName(type, usedNames);
        let amount = 0;
        let frequency;
        let reminderDays = 0;
        let autoPay = false;
        switch (type) {
            case "utility":
                amount = round2(rand(50, 250));
                frequency = "monthly";
                reminderDays = randInt(2, 5);
                autoPay = true;
                break;
            case "subscription":
                amount = round2(rand(5, 50));
                frequency = "monthly";
                reminderDays = randInt(1, 3);
                autoPay = true;
                break;
            case "loan":
                amount = round2(rand(200, 1500));
                frequency = "monthly";
                reminderDays = randInt(3, 7);
                autoPay = true;
                break;
            case "insurance":
                amount = round2(rand(100, 800));
                frequency = frequencyOptions[randInt(1, 2)];
                reminderDays = randInt(7, 14);
                autoPay = Math.random() < 0.7;
                break;
            case "other":
                amount = round2(rand(20, 500));
                frequency = frequencyOptions[randInt(0, 2)];
                reminderDays = randInt(1, 10);
                autoPay = Math.random() < 0.5;
                break;
        }
        const dueDay = randInt(1, 28);
        let lastPayment = undefined;
        if (Math.random() < 0.7) {
            lastPayment = generateLastPayment(frequency, dueDay);
        }
        bills.push({
            type,
            name,
            amount,
            dueDay,
            frequency,
            reminderDays,
            autoPay,
            lastPayment,
        });
    }
    console.log(bills.slice(0, 3));
    return bills;
}
const NAME_POOL = {
    utility: [
        "Electricity Bill",
        "Water Bill",
        "Internet Service",
        "Gas Bill",
        "Waste Collection",
    ],
    subscription: [
        "Netflix",
        "Spotify",
        "Apple Music",
        "Amazon Prime",
        "Cloud Storage",
    ],
    loan: ["Student Loan", "Car Loan", "Personal Loan", "Mortgage Payment"],
    insurance: [
        "Health Insurance",
        "Car Insurance",
        "Home Insurance",
        "Life Insurance",
    ],
    other: ["Gym Membership", "Club Membership", "HOA Fees", "Maintenance Fee"],
};
function pickName(type, used) {
    const pool = NAME_POOL[type];
    let name = pool[randInt(0, pool.length - 1)];
    while (used.has(name)) {
        name = pool[randInt(0, pool.length - 1)];
    }
    used.add(name);
    return name;
}
function generateLastPayment(frequency, dueDay) {
    const now = new Date();
    let past = new Date(now);
    switch (frequency) {
        case "monthly":
            past.setMonth(now.getMonth() - randInt(1, 3));
            break;
        case "quarterly":
            past.setMonth(now.getMonth() - randInt(3, 9));
            break;
        case "yearly":
            past.setFullYear(now.getFullYear() - randInt(1, 2));
            break;
    }
    past.setDate(dueDay);
    past.setHours(randInt(8, 20), randInt(0, 59), randInt(0, 59));
    return past;
}
//# sourceMappingURL=sytem.js.map