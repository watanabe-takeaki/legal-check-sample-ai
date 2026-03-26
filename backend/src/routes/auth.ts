import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
import prisma from '../lib/prisma';
import { AuthRequest, requireAuth } from '../middleware/authMiddleware';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' });

/**
 * サインアップ
 */
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'メールアドレスとパスワードは必須です。' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'パスワードは8文字以上にしてください。' });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(400).json({ error: 'このメールアドレスは既に登録されています。' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Stripeカスタマーを作成（APIキーが設定されていない場合はスキップ）
    let stripeCustomerId: string | undefined;
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const customer = await stripe.customers.create({ email });
        stripeCustomerId = customer.id;
      } catch (err: any) {
        console.warn('Stripe customer creation skipped:', err.message);
      }
    }

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        stripeCustomerId: stripeCustomerId || null,
      },
    });

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '30d',
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        subscriptionStatus: user.subscriptionStatus,
      },
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'サインアップに失敗しました。' });
  }
});

/**
 * ログイン
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'メールアドレスとパスワードは必須です。' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません。' });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません。' });
      return;
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '30d',
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        subscriptionStatus: user.subscriptionStatus,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'ログインに失敗しました。' });
  }
});

/**
 * ユーザー情報取得
 */
router.get('/me', requireAuth as any, async (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

export const authRouter = router;
