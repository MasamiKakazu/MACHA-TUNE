import { appleLookupUrl, appleSearchUrl, catalogPath } from './src/catalog-endpoints.js';

function sendJson(response, status, data) {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(JSON.stringify(data));
}

export function installCatalogMiddleware(server) {
  server.middlewares.use(async (request, response, next) => {
    const url = new URL(request.url, 'http://macha-tune.invalid');
    const prefix = server.config.base + catalogPath;
    if (!url.pathname.startsWith(prefix)) return next();
    const operation = url.pathname.slice(prefix.length);
    if (operation !== 'search' && operation !== 'lookup') return next();
    if (request.method !== 'GET') {
      response.setHeader('Allow', 'GET');
      return sendJson(response, 405, { error: 'GETのみ使用できます。' });
    }

    const term = url.searchParams.get('term')?.trim() ?? '';
    const ids = url.searchParams.get('id') ?? '';
    if (operation === 'search' ? !term || term.length > 201 : !/^[1-9]\d{0,14}(?:,[1-9]\d{0,14}){0,2}$/.test(ids)) {
      return sendJson(response, 400, { error: '検索条件または曲IDが無効です。' });
    }

    const upstream = operation === 'search' ? appleSearchUrl(term) : appleLookupUrl(ids);
    try {
      const result = await fetch(upstream, { signal: AbortSignal.timeout(6500) });
      if (!result.ok) {
        const retryAfter = result.headers.get('retry-after');
        if (retryAfter) response.setHeader('Retry-After', retryAfter);
        return sendJson(response, result.status === 429 ? 429 : 502, {
          error: 'Appleカタログに接続できませんでした。', upstreamStatus: result.status,
        });
      }
      const data = await result.json().catch(error => {
        if (error instanceof SyntaxError) return null;
        throw error;
      });
      if (!Array.isArray(data?.results)) return sendJson(response, 502, { error: 'Appleカタログの応答形式が無効です。' });
      sendJson(response, 200, data);
    } catch (error) {
      const timeout = error.name === 'TimeoutError';
      console.warn('Appleカタログ接続エラー:', error.cause?.code ?? error.name);
      sendJson(response, timeout ? 504 : 502, {
        error: timeout ? 'Appleカタログへの接続がタイムアウトしました。' : 'Appleカタログとの通信に失敗しました。',
      });
    }
  });
}
