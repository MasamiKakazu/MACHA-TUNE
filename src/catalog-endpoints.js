export const catalogPath = 'api/music-catalog/';

export function appleSearchUrl(term) {
  const url = new URL('https://itunes.apple.com/search');
  url.search = new URLSearchParams({ term, country: 'jp', media: 'music', entity: 'song', limit: '8' });
  return url;
}

export function appleLookupUrl(ids) {
  const url = new URL('https://itunes.apple.com/lookup');
  url.search = new URLSearchParams({ id: ids, country: 'jp' });
  return url;
}
