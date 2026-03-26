import { NextRequest } from 'next/server';

const getBackendUrl = () => {
  const backend = process.env.BACKEND_URL || 'backend:8080';
  return backend.startsWith('http') ? backend : `http://${backend}`;
};

export async function GET(request: NextRequest, { params }: { params: { route: string[] } }) {
  try {
    const path = params.route.join('/');
    const url = new URL(request.url);
    const targetUrl = `${getBackendUrl()}/api/${path}${url.search}`;
    
    console.log(`[Proxy GET] Requesting: ${targetUrl}`);

    const headers = new Headers(request.headers);
    headers.delete('host'); // backend側でホストヘッダーの不一致が起きないように削除

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
    });

    console.log(`[Proxy GET] Response status: ${response.status}`);

    return new Response(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    console.error('[Proxy GET Error]', error);
    return new Response(JSON.stringify({ error: 'Proxy GET failed', details: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: NextRequest, { params }: { params: { route: string[] } }) {
  try {
    const path = params.route.join('/');
    const url = new URL(request.url);
    const targetUrl = `${getBackendUrl()}/api/${path}${url.search}`;

    console.log(`[Proxy POST] Requesting: ${targetUrl}`);

    const headers = new Headers(request.headers);
    headers.delete('host');

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: request.body,
      // @ts-ignore
      duplex: 'half',
    });

    console.log(`[Proxy POST] Response status: ${response.status}`);

    return new Response(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    console.error('[Proxy POST Error]', error);
    return new Response(JSON.stringify({ error: 'Proxy POST failed', details: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
