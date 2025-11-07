import express, { Request, Response, NextFunction } from 'express';

import summarizeRoutes from './routes/summarize.route';
import cors from 'cors';



const app = express();

// 🧭 Log every request (helps debug CORS preflights)
app.use((req, res, next) => {
  console.log(`👉 ${req.method} ${req.url}`);
  next();
});

// Apply CORS before routes so preflight is handled
app.use(
  cors({
    origin: 'http://localhost:4200',  // strict origin instead of env var
    methods: ['GET', 'POST', 'OPTIONS'],  // only methods we actually use
    allowedHeaders: ['Content-Type'],  // simplified headers
  })
);
app.options('*', cors());

// JSON body parser
app.use(express.json());

// JSON parse error handler (must be after express.json())
app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  if (err && (err instanceof SyntaxError || err.type === 'entity.parse.failed')) {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  next(err);
});

// Redirect/alias for common typo
app.get('/api/summarizer', (_req, res) => res.redirect(307, '/api/summarize'));

// Mount routes
app.use('/api/summarize', summarizeRoutes);

app.get('/', (_req, res) => {
  res.send('Summarizer backend is running!');
});

export default app;