import { NextRequest, NextResponse } from 'next/server';

function getBackendUrl(): string {
  const backend = process.env.BACKEND_URL || 'http://backend:8080';
  const url = backend.startsWith('http') ? backend : `http://${backend}`;
  return url;
}

function forwardHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };
  // Authorization ヘッダーを転送
  const auth = request.headers.get('Authorization');
  if (auth) {
    headers['Authorization'] = auth;
  }
  // Content-Type を転送
  const contentType = request.headers.get('Content-Type');
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  return headers;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { route: string[] } }
) {
  try {
    const path = params.route.join('/');
    const url = new URL(request.url);
    const targetUrl = `${getBackendUrl()}/api/${path}${url.search}`;

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: forwardHeaders(request),
    });

    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('[Proxy GET Error]', error);
    return NextResponse.json(
      { error: 'Backend connection failed', details: String(error) },
      { status: 502 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { route: string[] } }
) {
  try {
    const path = params.route.join('/');
    const url = new URL(request.url);
    const targetUrl = `${getBackendUrl()}/api/${path}${url.search}`;

    const body = await request.text();

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        ...forwardHeaders(request),
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body,
    });

    // SSEストリーミングレスポンスをそのまま返す
    if (response.headers.get('Content-Type')?.includes('text/event-stream')) {
      return new Response(response.body, {
        status: response.status,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('[Proxy POST Error]', error);
    return NextResponse.json(
      { error: 'Backend connection failed', details: String(error) },
      { status: 502 }
    );
  }
}
