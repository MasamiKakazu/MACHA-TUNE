const storagePrefix = 'macha-tune:registered-song:';
const unsaved = new Map();

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
