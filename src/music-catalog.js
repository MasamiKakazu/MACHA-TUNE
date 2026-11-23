import { appleTrackUrl } from './music-links.js';
import { getTrackPreview } from './song-preview-audio.js';
import { appleLookupUrl, appleSearchUrl, catalogPath } from './catalog-endpoints.js';

let searchCallbackId = 0;

export async function searchCatalogTracks(term) {
  if (import.meta.env.DEV) {
    const signal = AbortSignal.timeout(8000);
    const local = await fetchLocalCatalog('search', { term }, signal);
    if (local) return readSearchResults(local);
  }
  const url = appleSearchUrl(term);
  const signal = AbortSignal.timeout(4000);
  let response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    console.warn(signal.aborted ? 'iTunes検索がタイムアウトしました。' : 'iTunes検索の通信に失敗しました。', error);
    return searchWithAppleCallback(url);
  }
  if (!response.ok) throw new Error(`iTunes検索 HTTP ${response.status}`);
  try {
    return readSearchResults(await response.json());
  } catch (error) {
    throw new Error(signal.aborted ? 'iTunes検索がタイムアウトしました。' : 'iTunes検索の応答を読み取れませんでした。', { cause: error });
  }
}

function readSearchResults(data) {
  if (!Array.isArray(data?.results)) throw new Error('iTunesの検索応答に候補一覧がありません。');
  return data.results;
}

async function fetchLocalCatalog(operation, params, signal) {
  const appBase = new URL(import.meta.env.BASE_URL, location.origin);
  const url = new URL(catalogPath + operation, appBase);
  url.search = new URLSearchParams(params);
  const response = await fetch(url, { signal });
  // Static deployments may return the app shell or a 404 for the optional endpoint.
  if (response.status === 404 || !response.headers.get('content-type')?.includes('application/json')) return null;
  const data = await response.json();
  if (!response.ok) {
    const upstream = data.upstreamStatus ? ` (Apple HTTP ${data.upstreamStatus})` : '';
    throw new Error(`カタログ HTTP ${response.status}${upstream}: ${data.error ?? ''}`);
  }
  return data;
}

function searchWithAppleCallback(url) {
  return new Promise((resolve, reject) => {
    const callback = `machaTuneSearch${Date.now()}${++searchCallbackId}`;
    const script = document.createElement('script');
    const cleanup = () => {
      clearTimeout(timeout);
      script.remove();
      delete window[callback];
    };
    const fail = message => {
      cleanup();
      reject(new Error(message));
    };
    const timeout = setTimeout(() => fail('iTunes検索コールバックがタイムアウトしました。'), 6000);
    window[callback] = data => {
      cleanup();
      try {
        resolve(readSearchResults(data));
      } catch (error) {
        reject(error);
      }
    };
    url.searchParams.set('callback', callback);
    script.src = url.href;
    script.addEventListener('error', () => fail('iTunes検索スクリプトを読み込めませんでした。'), { once: true });
    script.addEventListener('load', () => {
      if (window[callback]) fail('iTunes検索の応答にコールバックがありませんでした。');
    }, { once: true });
    document.head.append(script);
  });
}

export function largeCatalogArtwork(url) {
  return url?.replace(/^(https:\/\/[^/]+\.mzstatic\.com\/.*\/)(?:100|300)x(?:100|300)bb(?=\.)/,
    (_, directory) => `${directory}600x600bb`);
}

export async function lookupCatalogTracks(trackIds, signal) {
  const ids = [...new Set(trackIds.map(String))].join(',');
  let data = await fetchLocalCatalog('lookup', { id: ids }, signal);
  if (!data) {
    const response = await fetch(appleLookupUrl(ids), { signal });
    if (!response.ok) return new Map();
    data = await response.json();
  }
  const results = readSearchResults(data);
  return new Map(results.filter(track => track.kind === 'song').map(track => {
    const appleMusic = appleTrackUrl(track);
    return [String(track.trackId), {
      artworkUrl: track.artworkUrl100?.replace(/100x100bb(?=\.)/, '300x300bb'),
      albumName: track.collectionName,
      preview: getTrackPreview(track, appleMusic),
      links: { appleMusic },
    }];
  }));
}
