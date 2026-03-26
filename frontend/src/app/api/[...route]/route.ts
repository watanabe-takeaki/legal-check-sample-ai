import { NextRequest, NextResponse } from 'next/server';

function getBackendUrl(): string {
  const backend = process.env.BACKEND_URL || 'backend:8080';
  const url = backend.startsWith('http') ? backend : `http://${backend}`;
  console.log(`[Proxy] BACKEND_URL env: "${process.env.BACKEND_URL}", resolved: "${url}"`);
  return url;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { route: string[] } }
) {
  try {
    const path = params.route.join('/');
    const url = new URL(request.url);
    const targetUrl = `${getBackendUrl()}/api/${path}${url.search}`;

    console.log(`[Proxy GET] ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.text();
    console.log(`[Proxy GET] Status: ${response.status}, Body length: ${data.length}`);

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

    console.log(`[Proxy POST] ${targetUrl}`);

    const body = await request.text();

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body,
    });

    console.log(`[Proxy POST] Status: ${response.status}`);

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
