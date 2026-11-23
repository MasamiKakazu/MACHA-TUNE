let activePreview = null;

export function getTrackPreview(track, appleUrl) {
  if (track.kind !== 'song' || !/^\d+$/.test(track.trackId) || !appleUrl) return null;
  try {
    const audio = new URL(track.previewUrl);
    const store = new URL(appleUrl);
    const storeTrackId = store.searchParams.get('i') ?? store.pathname.split('/').pop();
    if (audio.origin !== 'https://audio-ssl.itunes.apple.com' || audio.username || audio.password
      || storeTrackId !== String(track.trackId)) return null;
    store.searchParams.set('app', 'itunes');
    return { url: audio.href, storeUrl: store.href };
  } catch {
    return null;
  }
}

export function stopSongPreview() {
  if (!activePreview) return;
  const { audio, button, playLabel } = activePreview;
  activePreview = null;
  audio.pause();
  audio.removeAttribute('src');
  audio.load();
  button.textContent = playLabel;
}

export function createSongPreviewControls(preview, playLabel = '▶ 試聴') {
  const controls = document.createElement('div');
  controls.className = 'song-preview-controls';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'song-preview-play';
  button.textContent = playLabel;
  const status = document.createElement('p');
  status.className = 'song-preview-error';
  status.setAttribute('role', 'status');
  const credit = document.createElement('small');
  credit.textContent = 'Provided courtesy of iTunes';
  const badge = document.createElement('a');
  badge.className = 'song-preview-store';
  badge.href = preview.storeUrl;
  badge.target = '_blank';
  badge.rel = 'noopener noreferrer';
  const badgeImage = document.createElement('img');
  badgeImage.src = `${import.meta.env.BASE_URL}itunes-store-badge.png`;
  badgeImage.alt = 'iTunes Storeで入手';
  badge.append(badgeImage);
  controls.append(button, badge, credit, status);

  button.addEventListener('click', async () => {
    status.textContent = '';
    if (activePreview?.button === button && activePreview.playing) {
      activePreview.playing = false;
      activePreview.request += 1;
      activePreview.audio.pause();
      button.textContent = playLabel;
      return;
    }
    if (activePreview?.button !== button) {
      stopSongPreview();
      const audio = new Audio();
      audio.preload = 'none';
      const player = { audio, button, playLabel, playing: false, request: 0 };
      activePreview = player;
      audio.addEventListener('ended', () => {
        if (activePreview === player) stopSongPreview();
      });
      audio.addEventListener('error', () => {
        if (activePreview === player) {
          stopSongPreview();
          status.textContent = '試聴を再生できませんでした。';
        }
      });
      audio.src = preview.url;
    }
    const player = activePreview;
    const request = ++player.request;
    player.playing = true;
    button.textContent = '⏸ 一時停止';
    try {
      await player.audio.play();
    } catch {
      if (activePreview !== player || player.request !== request) return;
      stopSongPreview();
      status.textContent = '試聴を再生できませんでした。';
    }
  });
  return controls;
}
