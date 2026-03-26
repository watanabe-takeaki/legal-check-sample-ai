import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    subscriptionStatus: string;
  };
}

/**
 * JWT認証ミドルウェア
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'ログインが必要です。' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    prisma.user
      .findUnique({ where: { id: decoded.userId } })
      .then((user) => {
        if (!user) {
          res.status(401).json({ error: 'ユーザーが見つかりません。' });
          return;
        }
        req.user = {
          id: user.id,
          email: user.email,
          subscriptionStatus: user.subscriptionStatus,
        };
        next();
      })
      .catch(() => {
        res.status(500).json({ error: '認証エラーが発生しました。' });
      });
  } catch {
    res.status(401).json({ error: 'トークンが無効です。再度ログインしてください。' });
  }
}

/**
 * サブスクリプション有効チェックミドルウェア
 */
export function requireSubscription(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: 'ログインが必要です。' });
    return;
  }
  if (req.user.subscriptionStatus !== 'active') {
    res.status(403).json({
      error: 'サブスクリプションが有効ではありません。',
      code: 'SUBSCRIPTION_REQUIRED',
    });
    return;
  }
  next();
}
