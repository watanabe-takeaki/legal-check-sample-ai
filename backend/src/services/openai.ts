import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface GenerateDocumentParams {
  systemPrompt: string;
  userMessage: string;
}

export async function generateDocument(params: GenerateDocumentParams): Promise<string> {
  const { systemPrompt, userMessage } = params;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.3,
    max_tokens: 8000,
  });

  return completion.choices[0]?.message?.content || '文書の生成に失敗しました。';
}

export async function* streamDocument(params: GenerateDocumentParams): AsyncGenerator<string> {
  const { systemPrompt, userMessage } = params;

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.3,
    max_tokens: 8000,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}
