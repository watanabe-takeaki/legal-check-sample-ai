import { Router, Request, Response } from 'express';
import { documentTypes, getDocumentTypeById } from '../prompts/documentTypes';
import { systemPrompts, buildUserMessage } from '../prompts/systemPrompts';
import { streamDocument } from '../services/openai';
import { requireAuth, requireSubscription, AuthRequest } from '../middleware/authMiddleware';

export const documentsRouter = Router();

// 対応文書タイプ一覧を取得（認証不要）
documentsRouter.get('/types', (_req: Request, res: Response) => {
  const types = documentTypes.map(({ id, name, description, icon, color, fields }) => ({
    id,
    name,
    description,
    icon,
    color,
    fields,
  }));
  res.json(types);
});

// 特定の文書タイプ情報を取得（認証不要）
documentsRouter.get('/types/:id', (req: Request, res: Response) => {
  const docType = getDocumentTypeById(req.params.id);
  if (!docType) {
    res.status(404).json({ error: '指定された文書タイプが見つかりません。' });
    return;
  }
  res.json(docType);
});

// 文書を生成（認証 + サブスクリプション必須）
documentsRouter.post(
  '/generate',
  requireAuth as any,
  requireSubscription as any,
  async (req: AuthRequest, res: Response) => {
    try {
      const { documentTypeId, fields } = req.body;

      if (!documentTypeId || !fields) {
        res.status(400).json({ error: '文書タイプとフィールドは必須です。' });
        return;
      }

      const docType = getDocumentTypeById(documentTypeId);
      if (!docType) {
        res.status(404).json({ error: '指定された文書タイプが見つかりません。' });
        return;
      }

      const systemPrompt = systemPrompts[documentTypeId];
      if (!systemPrompt) {
        res.status(500).json({ error: 'プロンプトの設定が見つかりません。' });
        return;
      }

      const userMessage = buildUserMessage(documentTypeId, fields);

      // SSE (Server-Sent Events) でストリーミング
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');

      const generator = streamDocument({ systemPrompt, userMessage });

      for await (const chunk of generator) {
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error: any) {
      console.error('Document generation error:', error);

      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: '文書の生成中にエラーが発生しました。' })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: '文書の生成に失敗しました。', details: error.message });
      }
    }
  },
);
