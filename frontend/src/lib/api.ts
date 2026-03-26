let API_URL = process.env.NEXT_PUBLIC_API_URL || '';
if (API_URL && !API_URL.startsWith('http')) {
  API_URL = `https://${API_URL}`;
}

export interface DocumentType {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  fields: FormField[];
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'radio';
  placeholder: string;
  required: boolean;
  options?: { value: string; label: string }[];
}

export async function fetchDocumentTypes(): Promise<DocumentType[]> {
  const res = await fetch(`${API_URL}/api/documents/types`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch document types');
  return res.json();
}

export async function fetchDocumentType(id: string): Promise<DocumentType> {
  const res = await fetch(`${API_URL}/api/documents/types/${id}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch document type');
  return res.json();
}

export function generateDocumentStream(
  documentTypeId: string,
  fields: Record<string, string>,
  onChunk: (content: string) => void,
  onDone: () => void,
  onError: (error: string) => void,
) {
  const abortController = new AbortController();

  fetch(`${API_URL}/api/documents/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentTypeId, fields }),
    signal: abortController.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || '文書の生成に失敗しました。');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Stream not available');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) {
                onDone();
                return;
              }
              if (data.error) {
                onError(data.error);
                return;
              }
              if (data.content) {
                onChunk(data.content);
              }
            } catch {
              // skip invalid JSON
            }
          }
        }
      }
      onDone();
    })
    .catch((error) => {
      if (error.name !== 'AbortError') {
        onError(error.message);
      }
    });

  return () => abortController.abort();
}
