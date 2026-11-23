import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { curatedSongs, genre, regions } from './src/discovery-catalog.js';
import { songKey } from './src/song-history.js';

const maleVocalPlaylists = new Set([
  'ジャニーズ有名曲メドレー', 'メンズアイドル', '令和男子アイドルグループ',
  '平成・令和　男性アイドルグループ・ソロアーティスト　人気曲　総合マイベスト',
  '日本男性アイドル', '男性アイドル', '男性アイドルグループ',
]);
const femaleVocalPlaylists = new Set([
  'jpop_女性ボーカル', '女性ボーカル_邦ロック', '女性ボーカルバンド',
]);

const femaleIdolArtistIds = new Set([
  '08lN7bm4Etec8ETFxaTUmq', '1j2WhcTW00Zd2SjFYsJVc6', '539GTPlYhFLCL6eh4jnbYy',
  '3e3ubSlRDBFxokscDrbvpF', '01wau5CL3Z1vfJJWkzBkqg', '4v5IVXt3oH0iNuxW9O36BV',
  '6ckfItpfxpSYKrZ0OIXUuh', '3PLCOySHJ9zwED5yZvDtPZ', '03E7w8NrBr4lNCK33TQyil',
  '3Zl0EsuYV23OgNw6WqGelN', '0eQSoTI7sQENREQM8Klp2j', '4cDFYGC0CtsN86zvpCXsi4',
  '0CXdxGaAia8vQLHVRFXW8a', '02hwDSWEF0JdOgdIBw1gRT', '4Yq4M6kdQTjkPBOp7aPJrA',
  '1UyIqMBjk0DMexWtQF2X1i', '2jAtwNClGACPlYgR1QFAIq', '0hWvpmIrUgyPKOYvEGcERp',
  '4gEIINdqeWnlTnmdsCUVBf', '1DdzMfvcBzMgdX5iPu69wk', '4pPKLWtUwFk3RKIGuVZtcQ',
]);

// Recording codes for duet versions confirmed by the performer or the duet catalog.
const mixedVocalRecordings = new Set([
  'JPTF01710201', // 打上花火 — DAOKO × 米津玄師
  'JPPO01802569', // 点描の唄 — Mrs. GREEN APPLE feat. 井上苑子
  'JPWP00700048', // WINDING ROAD — 絢香 × コブクロ
  'QM6MZ1917908', // Boy With Luv — BTS feat. Halsey
]);

const playlistTags = new Map([
  ['+81_connect_j-hiphop_最新注目曲', [genre.hiphop]],
  ['classical_essentials', [genre.classical]],
  ['global_r&b', [genre.rnb]],
  ['r&b_jp', [genre.rnb]],
  ['gacha_pop', [genre.pop]],
  ['令和ポップス', [genre.pop]],
  ['jpop_女性ボーカル', [genre.jpop]],
  ['grunge_forever', [genre.rock, genre.alternative]],
  ['jazz_classics', [genre.jazz]],
  ['rock_classics', [genre.rock]],
  ['女性ボーカル_邦ロック', [genre.rock]],
  ['modern_blues_rock', [genre.rock]],
  ['got_blues', [genre.blues]],
  ['future_funk', [genre.funk]],
  ['i_love_my_70s_funk', [genre.funk]],
  ['i_love_my_80s_funk', [genre.funk]],
  ['i_love_my_90s_funk', [genre.funk]],
  ['punk_japan', [genre.punk]],
  ['pure_pop_punk', [genre.punk, genre.rock]],
  ...[
    '令和アイドルヒットソング🩷', '流行りのアイドルソング', '盛り上がるアイドル', '超有名アイドル曲',
    '超絶可愛いアイドルソング', ...maleVocalPlaylists,
  ].map(name => [name, [genre.idol]]),
]);

const domesticPlaylists = new Set([
  '+81_connect_j-hiphop_最新注目曲', 'r&b_jp', 'jpop_女性ボーカル', '女性ボーカル_邦ロック',
  'punk_japan', '日本男性アイドル',
]);

// These source recordings use a localized credit, a group credit or a remaster title.
const curatedAppleIdsBySpotifyId = new Map([
  ['5UWwZ5lm5PKu6eKsHAGxOk', 362133505], // Everlong
  ['1YQWosTIljIvxAgHWTp7KP', 157427932], // Take Five
  ['6L89mwZXSOwYl76YXfX13s', 1160082180], // Basket Case
  ['3DwQ7AH3xGD9h65ezslm6q', 1571968519], // Enter Sandman
  ['3kXoKlD84c6OmIcOLfrfEs', 1456623340], // September
  ['7znjbX9XdoQayIrVNdd50Z', 1422656474], // The Girl from Ipanema
]);

const sources = ['recommendation-candidates.json', 'playlist-all.json']
  .map(file => new URL(`./data/${file}`, import.meta.url));

function recordingVocals(recording, rows, competingTitle, artistIds) {
  if (mixedVocalRecordings.has(recording.isrc)) return ['female', 'male'];
  const metadata = `${recording.title} ${recording.album}`.normalize('NFKC');
  if (!recording.artist || /,/.test(recording.artist) || /\b(?:feat\.?|featuring)\b/i.test(recording.title)
    || /\b(?:covers?|karaoke|instrumental|inst|off[ -]?vocal|no[ -]?vocals?)\b|カバー|歌ってみた|カラオケ|インスト|オフボーカル|オルゴール/i.test(metadata)) return [];

  // A source position can point at a different recording of the same song.
  const sameRecordingSources = [...new Set(rows.filter(row => row.spotifyTrackId === recording.spotifyTrackId
    || (recording.isrc && row.isrc === recording.isrc)).map(row => row.source))];
  if (artistIds.some(id => femaleIdolArtistIds.has(id))
    && !maleVocalPlaylists.has(recording.source) && !competingTitle
    && !/\b(?:live|remix|version|ver\.?|acoustic|cover|karaoke|instrumental|inst)\b|ライブ|弾き語り|カバー|オルゴール/i.test(recording.title.normalize('NFKC'))) return ['female'];
  const female = sameRecordingSources.some(source => femaleVocalPlaylists.has(source));
  const maleLists = sameRecordingSources.filter(source => maleVocalPlaylists.has(source)).length;
  if (female) return maleLists ? [] : ['female'];
  // Require corroboration for male-idol recordings and leave ambiguous versions unclassified.
  if (maleLists < 2 || competingTitle
    || /\b(?:live|remix|version|ver\.?|acoustic)\b|ライブ|弾き語り|再録/.test(recording.title.normalize('NFKC').toLowerCase())) return [];
  return ['male'];
}

export function buildDiscoveryCatalog() {
  const [candidates, playlistRows] = sources.map(url => JSON.parse(readFileSync(url, 'utf8')));
  const rowsByPosition = new Map(playlistRows.map(row => [row.position, row]));
  const creditsByTitle = new Map();
  for (const { title, artist } of playlistRows) {
    const key = songKey(title, '');
    if (!creditsByTitle.has(key)) creditsByTitle.set(key, new Set());
    creditsByTitle.get(key).add(songKey('', artist));
  }
  const catalog = curatedSongs.map(({ id, ...song }) => ({ id: String(id), appleTrackId: id, ...song }));
  const songsByName = new Map(catalog.map(song => [songKey(song.title, song.artist), song]));
  const songsByAppleId = new Map(catalog.map(song => [song.appleTrackId, song]));

  for (const recording of candidates) {
    const { sourcePositions, spotifyTrackId, title, artist, artworkUrl } = recording;
    const rows = sourcePositions.map(position => {
      const row = rowsByPosition.get(position);
      if (!row) throw new Error(`Unknown playlist position: ${position}`);
      return row;
    });
    const playlists = new Set(rows.map(row => row.source));
    const key = songKey(title, artist);
    let song = songsByAppleId.get(curatedAppleIdsBySpotifyId.get(spotifyTrackId)) ?? songsByName.get(key);
    if (!song) {
      song = { id: spotifyTrackId, title, artist, tags: [] };
      catalog.push(song);
    } else if (key !== songKey(song.title, song.artist)) {
      (song.titleArtistAliases ??= []).push(key);
    }
    songsByName.set(key, song);
    if (!song.spotifyTrackId) {
      song.spotifyTrackId = spotifyTrackId;
      const artistIds = recording.artistUris?.split(',').map(uri => uri.trim().split(':').at(-1)) ?? [];
      const vocals = recordingVocals(recording, rows, creditsByTitle.get(songKey(title, ''))?.size > 1, artistIds);
      if (vocals.length) song.vocals = vocals;
    }
    if (artworkUrl?.startsWith('https://i.scdn.co/image/')) song.artworkUrl ??= artworkUrl;
    song.tags = [...new Set([...song.tags, ...[...playlists].flatMap(name => playlistTags.get(name) ?? [])])];
    if (!song.region && [...playlists].some(name => domesticPlaylists.has(name))) song.region = regions[1];
  }
  return catalog;
}

export function discoveryCatalogPlugin() {
  const moduleId = 'virtual:macha-tune-discovery';
  return {
    name: 'macha-tune-discovery-catalog',
    resolveId(id) {
      if (id === moduleId) return '\0' + moduleId;
    },
    load(id) {
      if (id !== '\0' + moduleId) return;
      for (const source of sources) this.addWatchFile(fileURLToPath(source));
      return `export default ${JSON.stringify(buildDiscoveryCatalog())};`;
    },
  };
}
