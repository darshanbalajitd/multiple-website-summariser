"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const summarize_route_1 = __importDefault(require("./routes/summarize.route"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
// 🧭 Log every request (helps debug CORS preflights)
app.use((req, res, next) => {
    console.log(`👉 ${req.method} ${req.url}`);
    next();
});
// Apply CORS before routes so preflight is handled
app.use((0, cors_1.default)({
    origin: 'http://localhost:4200', // strict origin instead of env var
    methods: ['GET', 'POST', 'OPTIONS'], // only methods we actually use
    allowedHeaders: ['Content-Type'], // simplified headers
}));
app.options('*', (0, cors_1.default)());
// JSON body parser
app.use(express_1.default.json());
// JSON parse error handler (must be after express.json())
app.use((err, _req, res, next) => {
    if (err && (err instanceof SyntaxError || err.type === 'entity.parse.failed')) {
        return res.status(400).json({ error: 'Invalid JSON payload' });
    }
    next(err);
});
// Redirect/alias for common typo
app.get('/api/summarizer', (_req, res) => res.redirect(307, '/api/summarize'));
// Mount routes
app.use('/api/summarize', summarize_route_1.default);
app.get('/', (_req, res) => {
    res.send('Summarizer backend is running!');
});
exports.default = app;
