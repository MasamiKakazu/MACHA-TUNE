const storagePrefix = 'macha-tune:registered-song:';
const introducedPrefix = 'macha-tune:introduced-song:';
const previousRecommendationsKey = 'macha-tune:previous-recommendations';
const unsaved = new Map();
const introducedIds = new Set();
let previousRecommendationIds = [];

export function saveIntroducedSongs(songs) {
  for (const { id } of songs) {
    introducedIds.add(String(id));
    try {
      localStorage.setItem(introducedPrefix + id, '1');
    } catch {
      // Keep filtering for this session when browser storage is unavailable.
    }
  }
  if (songs.length) {
    previousRecommendationIds = songs.map(song => String(song.id));
    try {
      localStorage.setItem(previousRecommendationsKey, JSON.stringify(previousRecommendationIds));
    } catch {
      // Preserve the last result in memory when storage is unavailable.
    }
  }
}

export function readPreviousRecommendationIds() {
  try {
    const ids = JSON.parse(localStorage.getItem(previousRecommendationsKey));
    if (Array.isArray(ids) && ids.every(id => typeof id === 'string')) return new Set(ids);
  } catch {
    // Use the last result from this session.
  }
  return new Set(previousRecommendationIds);
}

export function readIntroducedSongIds() {
  const ids = new Set(introducedIds);
  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key?.startsWith(introducedPrefix)) ids.add(key.slice(introducedPrefix.length));
    }
  } catch {
    return ids;
  }
  return ids;
}

export function songKey(title, artist) {
  const normalize = value => value.normalize('NFKC').toLowerCase().replace(/\s+/gu, '');
  return JSON.stringify([normalize(title), normalize(artist)]);
}

export function songTrackId(value) {
  return /^(?:[1-9]\d*)$/.test(value) ? String(value) : '';
}

export function saveRegisteredSongs(songs) {
  for (const { title, artist, selection } of songs) {
    const trackId = songTrackId(selection?.trackId);
    const key = storagePrefix + JSON.stringify([songKey(title, artist), trackId]);
    const record = { title: title.trim(), artist: artist.trim(), ...(trackId && { trackId }) };
    try {
      localStorage.setItem(key, JSON.stringify(record));
      unsaved.delete(key);
    } catch {
      // Keep filtering for this session when browser storage is unavailable.
      unsaved.set(key, record);
    }
  }
}

export function readRegisteredSongs() {
  const records = [...unsaved.values()];
  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key?.startsWith(storagePrefix)) continue;
      try {
        const record = JSON.parse(localStorage.getItem(key));
        if (typeof record?.title === 'string' && typeof record.artist === 'string') records.push(record);
      } catch {
        // Ignore only the damaged record.
      }
    }
  } catch {
    return records;
  }
  return records;
}
