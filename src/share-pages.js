export const sharePages = {
  diagnosis: {
    path: 'share/diagnosis.html',
    title: 'MACHA-TUNE診断結果',
    description: '音楽を聴くときのタイプと、おすすめの曲をチェック。',
  },
  discovery: {
    path: 'share/discovery.html',
    title: 'MACHA-TUNEで見つけた楽曲',
    description: '選んだジャンルから見つけたおすすめの曲をチェック。',
  },
};

export function sharedPayloadHash(payload) {
  const json = JSON.stringify(payload);
  const legacy = new URLSearchParams({ share: json }).toString();
  const bytes = new TextEncoder().encode(json);
  const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
  const compact = 's=' + btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
  return compact.length < legacy.length ? compact : legacy;
}

export function decodeCompactPayload(value) {
  const binary = atob(value.replaceAll('-', '+').replaceAll('_', '/'));
  const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}
