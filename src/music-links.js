const services = {
  spotify: {
    name: 'Spotify',
    hosts: ['open.spotify.com', 'spotify.link'],
    search: query => `https://open.spotify.com/search/${query}`,
    logo: '<circle cx="12" cy="12" r="11" fill="#1ed760"/><path d="M5 9c5-2 10-1 14 1m-13 2c4-1.5 8-1 12 1m-11 2c3-1 6-.5 9 1" fill="none" stroke="#121212" stroke-width="1.6" stroke-linecap="round"/>',
  },
  appleMusic: {
    name: 'Apple Music',
    hosts: ['music.apple.com'],
    search: query => `https://music.apple.com/jp/search?term=${query}`,
    logo: '<rect x="1" y="1" width="22" height="22" rx="5" fill="#fa2d55"/><path d="M10 7v9m7-11v9m-7-7 7-2" stroke="white" stroke-width="2" stroke-linejoin="round"/><ellipse cx="8" cy="16" rx="3" ry="2" fill="white"/><ellipse cx="15" cy="14" rx="3" ry="2" fill="white"/>',
  },
  youtubeMusic: {
    name: 'YouTube Music',
    hosts: ['music.youtube.com', 'www.youtube.com', 'youtube.com', 'youtu.be'],
    search: query => `https://music.youtube.com/search?q=${query}`,
    logo: '<circle cx="12" cy="12" r="11" fill="#f03"/><circle cx="12" cy="12" r="7" fill="none" stroke="white"/><path d="m10 8.5 5.5 3.5-5.5 3.5Z" fill="white"/>',
  },
};

function serviceUrl(key, value) {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && !url.username && !url.password && !url.port && services[key].hosts.includes(url.hostname)) return url;
  } catch {
    return null;
  }
  return null;
}

export function appleTrackUrl(track) {
  const direct = serviceUrl('appleMusic', track.trackViewUrl);
  if (direct && (/\/song\//.test(direct.pathname) || direct.searchParams.has('i'))) return direct.href;
  const trackId = track.trackId ?? direct?.searchParams.get('i');
  return /^\d+$/.test(trackId) ? `https://music.apple.com/jp/song/${trackId}` : '';
}

export function spotifyTrackUrl(trackId) {
  return /^[A-Za-z0-9]{22}$/.test(trackId) ? `https://open.spotify.com/track/${trackId}` : '';
}

export function appleTrackId(value) {
  const url = serviceUrl('appleMusic', value);
  if (!url) return '';
  const id = url.pathname.includes('/song/')
    ? url.pathname.split('/').filter(Boolean).at(-1)
    : url.pathname.includes('/album/') ? url.searchParams.get('i') : null;
  return /^[1-9]\d*$/.test(id) ? id : '';
}

export function savedServiceLinks(record) {
  return Object.fromEntries(Object.keys(services).flatMap(key => {
    const url = serviceUrl(key, record?.[key]);
    return url ? [[key, url.href]] : [];
  }));
}

export function createServiceLinks(draft) {
  const links = document.createElement('div');
  links.className = 'song-service-links';
  const query = encodeURIComponent(`${draft.title.trim()} ${draft.artist.trim()}`);
  const direct = { ...savedServiceLinks(draft.selection?.links), ...savedServiceLinks(draft.links) };
  for (const [key, service] of Object.entries(services)) {
    const link = document.createElement('a');
    link.className = `song-service-link service-${key}`;
    link.href = direct[key] || service.search(query);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${service.logo}</svg>`;
    const isSearch = !direct[key] || /^\/(?:(?:intl-)?[a-z]{2}(?:-[a-z]{2})?\/)?(?:search|results)(?:\/|$)/i.test(new URL(link.href).pathname);
    link.append(`${service.name}で${isSearch ? '検索' : '開く'}`);
    links.append(link);
  }
  return links;
}

async function musicBrainz(path, params, signal) {
  const query = new URLSearchParams({ fmt: 'json', ...params });
  const response = await fetch(`https://musicbrainz.org/ws/2/${path}?${query}`, { signal });
  return response.ok ? response.json() : null;
}

export async function resolveServiceLinks(selection, signal) {
  let recording;
  if (/^[A-Z]{2}[A-Z0-9]{3}\d{7}$/.test(selection.isrc)) {
    const result = await musicBrainz(`isrc/${selection.isrc}`, { inc: 'url-rels' }, signal);
    if (result?.recordings?.length === 1) [recording] = result.recordings;
  }
  if (!recording && selection.links.appleMusic) {
    const appleUrl = new URL(selection.links.appleMusic);
    const trackId = appleUrl.searchParams.get('i');
    appleUrl.search = '';
    if (trackId) appleUrl.searchParams.set('i', trackId);
    const match = await musicBrainz('url', { resource: appleUrl.href, inc: 'recording-rels' }, signal);
    const ids = new Set(match?.relations?.map(relation => relation.recording?.id).filter(Boolean));
    if (ids.size === 1) {
      const [id] = ids;
      recording = await musicBrainz(`recording/${id}`, { inc: 'url-rels' }, signal);
    }
  }
  const spotify = new Set();
  const youtube = new Set();
  for (const relation of recording?.relations ?? []) {
    const resource = relation.url?.resource;
    const spotifyUrl = serviceUrl('spotify', resource);
    const youtubeUrl = serviceUrl('youtubeMusic', resource);
    if (spotifyUrl?.hostname === 'open.spotify.com' && /^\/track\/[\da-z]{22}\/?$/i.test(spotifyUrl.pathname)) {
      spotify.add(`https://open.spotify.com${spotifyUrl.pathname.replace(/\/$/, '')}`);
    }
    const videoId = youtubeUrl?.hostname === 'youtu.be' ? youtubeUrl.pathname.slice(1)
      : youtubeUrl?.pathname === '/watch' ? youtubeUrl.searchParams.get('v') : null;
    if (/^[\w-]{11}$/.test(videoId) && (youtubeUrl.hostname === 'music.youtube.com' || relation.type === 'free streaming')) {
      youtube.add(`https://music.youtube.com/watch?v=${videoId}`);
    }
  }
  return {
    ...(spotify.size === 1 && { spotify: [...spotify][0] }),
    ...(youtube.size === 1 && { youtubeMusic: [...youtube][0] }),
  };
}
