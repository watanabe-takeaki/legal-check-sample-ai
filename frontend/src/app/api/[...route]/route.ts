import { NextRequest } from 'next/server';

export const runtime = 'edge';

const getBackendUrl = () => {
  const backend = process.env.BACKEND_URL || 'backend:8080';
  return backend.startsWith('http') ? backend : `http://${backend}`;
};

export async function GET(request: NextRequest, { params }: { params: { route: string[] } }) {
  const path = params.route.join('/');
  const url = new URL(request.url);
  const targetUrl = `${getBackendUrl()}/api/${path}${url.search}`;

  const headers = new Headers(request.headers);
  headers.delete('host'); // backend側でホストヘッダーの不一致が起きないように削除

  const response = await fetch(targetUrl, {
    method: 'GET',
    headers,
  });

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  });
}

export async function POST(request: NextRequest, { params }: { params: { route: string[] } }) {
  const path = params.route.join('/');
  const url = new URL(request.url);
  const targetUrl = `${getBackendUrl()}/api/${path}${url.search}`;

  const headers = new Headers(request.headers);
  headers.delete('host');

  const response = await fetch(targetUrl, {
    method: 'POST',
    headers,
    body: request.body,
    // @ts-ignore: duplex is required for streaming bodies in node fetch but types might be outdated
    duplex: 'half',
  });

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  });
}
