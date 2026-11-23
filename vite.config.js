import { readFileSync } from 'node:fs';
import { defineConfig, loadEnv } from 'vite';
import { sharePages } from './src/share-pages.js';
import { installCatalogMiddleware } from './catalog-server.js';

const bannerName = 'share-banner.png';
const banner = readFileSync(new URL('./docs/images/macha-tune-banner.png', import.meta.url));
const index = new URL('./index.html', import.meta.url);

function escapeAttribute(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function withShareMetadata(html, page, image) {
  const tags = {
    'og:type': 'website',
    'og:site_name': 'MACHA-TUNE',
    'og:title': page.title,
    'og:description': page.description,
    'og:image': image,
    'og:image:alt': 'MACHA-TUNEのバナー',
    'og:locale': 'ja_JP',
  };
  const meta = Object.entries(tags)
    .map(([property, value]) => `    <meta property="${property}" content="${escapeAttribute(value)}">`)
    .join('\n');
  return html.replace('<title>MACHA-TUNE</title>', `<title>${page.title}</title>\n${meta}`);
}

function sharePagePlugin(publicUrl) {
  const pages = Object.values(sharePages);
  const publicBase = publicUrl ? new URL(publicUrl.endsWith('/') ? publicUrl : `${publicUrl}/`) : null;
  return {
    name: 'macha-tune-share-pages',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const pathname = request.url?.split('?')[0];
        const base = server.config.base;
        if (pathname === base + bannerName) {
          response.setHeader('Content-Type', 'image/png');
          response.end(banner);
          return;
        }
        const page = pages.find(entry => pathname === base + entry.path);
        if (!page) return next();
        try {
          const protocol = server.config.server.https ? 'https' : 'http';
          const imageBase = publicBase ?? new URL(base, `${protocol}://${request.headers.host}`);
          const html = await server.transformIndexHtml(`${base}index.html`, readFileSync(index, 'utf8'));
          response.setHeader('Content-Type', 'text/html; charset=utf-8');
          response.end(withShareMetadata(html, page, new URL(bannerName, imageBase).href));
        } catch (error) {
          next(error);
        }
      });
    },
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        const html = bundle['index.html'].source;
        const image = publicBase ? new URL(bannerName, publicBase).href : `../${bannerName}`;
        this.emitFile({ type: 'asset', fileName: bannerName, source: banner });
        for (const page of pages) {
          this.emitFile({ type: 'asset', fileName: page.path, source: withShareMetadata(html, page, image) });
        }
      },
    },
  };
}

export default defineConfig(({ command, isPreview, mode }) => {
  const { MACHA_TUNE_PUBLIC_URL } = loadEnv(mode, process.cwd(), 'MACHA_TUNE_');
  return {
    base: command === 'build' || isPreview ? '/MACHA-TUNE/' : '/',
    plugins: [
      {
        name: 'macha-tune-catalog',
        configureServer: installCatalogMiddleware,
        configurePreviewServer: installCatalogMiddleware,
      },
      sharePagePlugin(MACHA_TUNE_PUBLIC_URL),
    ],
  };
});
