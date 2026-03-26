import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { documentsRouter } from './routes/documents';
import { authRouter } from './routes/auth';
import { stripeRouter } from './routes/stripe';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://frontend:3000',
  'https://tachistoscopic-delora-resentfully.ngrok-free.dev',
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.onrender.com')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  credentials: true,
}));

// Stripe Webhookにはrawボディが必要（JSON parseの前に設定）
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/stripe', stripeRouter);
app.use('/api/documents', documentsRouter);

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'サーバーエラーが発生しました。' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
