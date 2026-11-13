import type { IncomingMessage, ServerResponse } from 'node:http';

type VercelRequest = IncomingMessage & {
  body?: unknown;
  query?: Record<string, string | string[]>;
};

type VercelResponse = ServerResponse & {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  const scriptUrl = process.env.GAS_WEB_APP_URL;
  const apiSecret = process.env.GAS_API_SECRET;
  if (!scriptUrl || !apiSecret) {
    return res.status(503).json({ error: 'Apps Script belum dikonfigurasi pada environment server.' });
  }

  try {
    const requestUrl = new URL(req.url || '/', 'https://vercel.invalid');
    const query: Record<string, string> = {};
    requestUrl.searchParams.forEach((value, key) => { query[key] = value; });
    const authorization = req.headers.authorization || '';
    const sessionToken = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
    const forwardedFor = req.headers['x-forwarded-for'];
    const clientIp = Array.isArray(forwardedFor) ? forwardedFor[0] : String(forwardedFor || 'unknown').split(',').pop()?.trim() || 'unknown';

    const upstream = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        apiRequest: {
          apiSecret,
          sessionToken,
          method: req.method || 'GET',
          path: requestUrl.pathname,
          query,
          clientIp,
          body: req.body || {}
        }
      })
    });
    const data = await upstream.json() as Record<string, unknown>;
    const status = Number(data?._httpStatus || (upstream.ok ? 200 : upstream.status));
    delete data._httpStatus;
    return res.status(status).json(data);
  } catch (error) {
    return res.status(502).json({
      error: 'Tidak dapat menghubungi Google Apps Script.',
      detail: error instanceof Error ? error.message : String(error)
    });
  }
}
