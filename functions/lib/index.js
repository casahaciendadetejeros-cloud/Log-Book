"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const https_1 = require("firebase-functions/v2/https");
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
// Initialize Firebase Admin
(0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
// Define schemas
const insertVisitorSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    phone: zod_1.z.string().min(1, "Phone is required"),
    email: zod_1.z.string().email("Invalid email format")
});
const insertUserSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, "Username is required"),
    password: zod_1.z.string().min(1, "Password is required")
});
// Create Express app
const app = (0, express_1.default)();
app.use(express_1.default.json());
// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    }
    else {
        next();
    }
});
// Visitor routes
app.post('/visitors', async (req, res) => {
    try {
        const validatedData = insertVisitorSchema.parse(req.body);
        // Generate control number
        const year = new Date().getFullYear();
        const visitorsRef = db.collection('visitors');
        const snapshot = await visitorsRef.count().get();
        const controlNumber = `#TL-${year}-${(snapshot.data().count + 1).toString().padStart(3, '0')}`;
        const visitorData = Object.assign(Object.assign({}, validatedData), { controlNumber, createdAt: new Date() });
        const docRef = await visitorsRef.add(visitorData);
        const visitor = Object.assign({ id: docRef.id }, visitorData);
        res.json(visitor);
    }
    catch (error) {
        console.error('Error creating visitor:', error);
        res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid visitor data' });
    }
});
app.get('/visitors', async (req, res) => {
    try {
        const { date, search } = req.query;
        const visitorsRef = db.collection('visitors');
        let query = visitorsRef.orderBy('createdAt', 'desc');
        if (search && typeof search === 'string') {
            // Simple search implementation
            const snapshot = await query.get();
            const visitors = snapshot.docs
                .map(doc => (Object.assign({ id: doc.id }, doc.data())))
                .filter((visitor) => {
                var _a, _b, _c, _d;
                return ((_a = visitor.name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(search.toLowerCase())) ||
                    ((_b = visitor.phone) === null || _b === void 0 ? void 0 : _b.includes(search)) ||
                    ((_c = visitor.email) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(search.toLowerCase())) ||
                    ((_d = visitor.controlNumber) === null || _d === void 0 ? void 0 : _d.includes(search));
            });
            res.json(visitors);
        }
        else if (date && typeof date === 'string') {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            const snapshot = await query
                .where('createdAt', '>=', startOfDay)
                .where('createdAt', '<=', endOfDay)
                .get();
            const visitors = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
            res.json(visitors);
        }
        else {
            const snapshot = await query.get();
            const visitors = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
            res.json(visitors);
        }
    }
    catch (error) {
        console.error('Error fetching visitors:', error);
        res.status(500).json({ message: 'Failed to fetch visitors' });
    }
});
app.get('/visitors/:id', async (req, res) => {
    try {
        const doc = await db.collection('visitors').doc(req.params.id).get();
        if (!doc.exists) {
            return res.status(404).json({ message: 'Visitor not found' });
        }
        res.json(Object.assign({ id: doc.id }, doc.data()));
    }
    catch (error) {
        console.error('Error fetching visitor:', error);
        res.status(500).json({ message: 'Failed to fetch visitor' });
    }
});
// Statistics route
app.get('/statistics', async (req, res) => {
    try {
        const visitorsRef = db.collection('visitors');
        // Today's visitors
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todaySnapshot = await visitorsRef
            .where('createdAt', '>=', today)
            .where('createdAt', '<', tomorrow)
            .count()
            .get();
        // This week's visitors
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);
        const weekSnapshot = await visitorsRef
            .where('createdAt', '>=', weekAgo)
            .count()
            .get();
        // Total visitors
        const totalSnapshot = await visitorsRef.count().get();
        res.json({
            todayVisitors: todaySnapshot.data().count,
            weekVisitors: weekSnapshot.data().count,
            totalVisitors: totalSnapshot.data().count
        });
    }
    catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ message: 'Failed to fetch statistics' });
    }
});
// User authentication routes
app.post('/users', async (req, res) => {
    try {
        const validatedData = insertUserSchema.parse(req.body);
        const docRef = await db.collection('users').add(Object.assign(Object.assign({}, validatedData), { createdAt: new Date() }));
        res.json({ id: docRef.id, username: validatedData.username });
    }
    catch (error) {
        console.error('Error creating user:', error);
        res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid user data' });
    }
});
app.get('/users/:username', async (req, res) => {
    try {
        const snapshot = await db.collection('users')
            .where('username', '==', req.params.username)
            .limit(1)
            .get();
        if (snapshot.empty) {
            return res.status(404).json({ message: 'User not found' });
        }
        const doc = snapshot.docs[0];
        res.json(Object.assign({ id: doc.id }, doc.data()));
    }
    catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Failed to fetch user' });
    }
});
// Export the Express app as a Firebase Function
exports.api = (0, https_1.onRequest)(app);
//# sourceMappingURL=index.js.map