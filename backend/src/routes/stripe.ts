import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import prisma from '../lib/prisma';
import { AuthRequest, requireAuth } from '../middleware/authMiddleware';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' });
const PRICE_ID = process.env.STRIPE_PRICE_ID || '';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';

/**
 * Checkout Session作成（サブスクリプション）
 */
router.post('/create-checkout', requireAuth as any, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'ログインが必要です。' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      res.status(400).json({ error: 'ユーザーが見つかりません。' });
      return;
    }

    // stripeCustomerIdがない場合は自動作成
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // 既にアクティブなサブスクがある場合はポータルへ
    if (user.subscriptionStatus === 'active') {
      res.status(400).json({ error: '既にサブスクリプションが有効です。' });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: `${FRONTEND_URL}/?payment=success`,
      cancel_url: `${FRONTEND_URL}/pricing?payment=cancelled`,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Checkout Sessionの作成に失敗しました。' });
  }
});

/**
 * Customer Portal作成（解約・プラン変更）
 */
router.post('/create-portal', requireAuth as any, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'ログインが必要です。' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || !user.stripeCustomerId) {
      res.status(400).json({ error: 'Stripeカスタマー情報が見つかりません。' });
      return;
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${FRONTEND_URL}/`,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Portal error:', error);
    res.status(500).json({ error: 'Customer Portalの作成に失敗しました。' });
  }
});

/**
 * サブスクリプション状態をStripeから直接同期
 * Webhookが届かない場合のフォールバック
 */
router.post('/sync-status', requireAuth as any, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'ログインが必要です。' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || !user.stripeCustomerId) {
      res.status(400).json({ error: 'Stripeカスタマー情報が見つかりません。' });
      return;
    }

    // Stripeからサブスクリプション一覧を取得
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length > 0) {
      const sub = subscriptions.data[0];
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionId: sub.id,
          subscriptionStatus: 'active',
        },
      });
      console.log(`[Stripe Sync] Subscription activated for ${user.email}`);
      res.json({ subscriptionStatus: 'active' });
    } else {
      res.json({ subscriptionStatus: user.subscriptionStatus });
    }
  } catch (error: any) {
    console.error('Sync status error:', error);
    res.status(500).json({ error: 'サブスクリプション状態の同期に失敗しました。' });
  }
});

/**
 * Stripe Webhook
 */
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  let event: Stripe.Event;

  try {
    // req.body は rawBody（Express設定で対応）
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).json({ error: 'Webhookの検証に失敗しました。' });
    return;
  }

  console.log(`[Stripe Webhook] Event: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.customer && session.subscription) {
          await prisma.user.update({
            where: { stripeCustomerId: session.customer as string },
            data: {
              subscriptionId: session.subscription as string,
              subscriptionStatus: 'active',
            },
          });
          console.log(`[Stripe] Subscription activated for customer ${session.customer}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await prisma.user.update({
          where: { stripeCustomerId: subscription.customer as string },
          data: {
            subscriptionStatus: subscription.status === 'active' ? 'active' : 'inactive',
          },
        });
        console.log(`[Stripe] Subscription updated: ${subscription.status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await prisma.user.update({
          where: { stripeCustomerId: subscription.customer as string },
          data: {
            subscriptionId: null,
            subscriptionStatus: 'inactive',
          },
        });
        console.log(`[Stripe] Subscription deleted for customer ${subscription.customer}`);
        break;
      }

      default:
        console.log(`[Stripe] Unhandled event type: ${event.type}`);
    }
  } catch (error: any) {
    console.error('Webhook processing error:', error);
  }

  res.json({ received: true });
});

export const stripeRouter = router;
