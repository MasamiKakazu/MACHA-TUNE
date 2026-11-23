import { appleTrackId, appleTrackUrl, createServiceLinks, resolveServiceLinks, savedServiceLinks } from './music-links.js';
import { createSongPreviewControls, getTrackPreview, stopSongPreview } from './song-preview-audio.js';
import { mainGenres, extraGenreGroups, regions, formatDiscoveryGenres, recommendSongs } from './discovery-catalog.js';
import { largeCatalogArtwork, lookupCatalogTracks, searchCatalogTracks } from './music-catalog.js';
import { readRegisteredSongs, saveRegisteredSongs, songTrackId } from './song-history.js';
import { sharePages } from './share-pages.js';
import lyricsCharacter from './assets/charactors/lyrics.png';
import melodyCharacter from './assets/charactors/melody.png';
import rhythmCharacter from './assets/charactors/rhythm.png';
import atmosphereCharacter from './assets/charactors/atmosphere.png';

const questions = [
  {
    prompt: '初めて聴く曲、最初に耳に残るのは？',
    answers: ['印象的な歌詞', 'サビのメロディー', 'ドラムやベースの刻み', '声や楽器の響き'],
  },
  {
    prompt: 'もう一度再生したくなるのは？',
    answers: ['歌詞の意味を確かめたいとき', '口ずさみたいフレーズがあるとき', 'あのリズムに乗りたいとき', '曲の雰囲気・世界観に浸りたいとき'],
  },
  {
    prompt: '人にすすめるなら、どこを聴いてほしい？',
    answers: ['自分に刺さった歌詞', 'サビに入る瞬間の曲の展開', '思わず体がリズムに乗るところ', 'イントロで景色が浮かぶところ'],
  },
  {
    prompt: '歌詞のない曲を聴くときは？',
    answers: ['曲に合いそうなストーリーを想像する', 'メロディーをじっくり聴く', 'リズムに乗る', '楽器の音色に耳を澄ます'],
  },
  {
    prompt: 'ライブで一番楽しみなのは？',
    answers: ['好きな歌詞を生で聴く瞬間', 'みんなでサビを歌う瞬間', '会場全体で手拍子する瞬間', '音に包まれる臨場感'],
  },
  {
    prompt: '聴き終わったあとに残るのは？',
    answers: ['自分に重なる歌詞', '頭の中で流れるメロディー', '自然と刻んでしまうテンポ', 'その曲を聴いて残った余韻'],
  },
];
const types = [
  { id: 'lyrics', name: '言葉に惹かれるタイプ', description: '何気ない歌詞が自分の記憶や感情と重なる瞬間、歌詞の奥にある物語まで想像して聴くタイプです。ふと耳にしたフレーズを、あとから何度も思い返すことがあります。', shareDescription: '歌詞の言葉や物語に、自分の記憶や気持ちを重ねて聴くタイプです。心に残ったフレーズを何度も思い返します。', insight: '言葉の意味や背景を確かめながら、曲に込められた気持ちを受け取る聴き方が表れています。', tip: '同じサビを1番と最後で聴き比べて、歌詞の景色がどう変わるか味わってみましょう。', character: lyricsCharacter },
  { id: 'melody', name: 'メロディーを口ずさむタイプ', description: 'ふとした時にサビのメロディーが口からこぼれることが多いタイプです。歌いたくなるフレーズを何度もたどるうちに、曲がより日常の一部として溶け込みます。', shareDescription: 'サビや印象的なメロディーを追いかけ、思わず口ずさみたくなるフレーズを見つけるタイプです。曲が日常に残る旋律を楽しみます。', insight: 'メロディー重視で、口ずさみたくなるフレーズを見つける聴き方が表れています。', tip: '同じ曲の弾き語り版で、歌声に隠れていたメロディーを追ってみましょう。', character: melodyCharacter },
  { id: 'rhythm', name: '体でリズムに乗るタイプ', description: '好きだと気づく前に指や足、体全体で拍を刻むタイプです。ドラムやベースの重なりが、曲をもう一度聴きたくなる合図になります。', shareDescription: 'ビートを聴くと、指や足で自然に拍を刻みたくなるタイプです。ドラムやベースの重なりから曲のノリを楽しみます。', insight: '体でノリノリにリズムを受け取る聴き方が表れています。', tip: 'ライブ版で手拍子とドラムの重なりに耳を向けてみましょう。', character: rhythmCharacter },
  { id: 'atmosphere', name: '曲の世界観に浸るタイプ', description: 'イントロから曲が描くストーリーや景色が浮かび、曲の世界観をじっくり味わうタイプです。音の余韻や空気ごと味わうことで、その曲ならではの風景を想像して楽曲を楽しみます。', shareDescription: '音が重なると、ふっと景色が浮かぶ。曲がつくる空気にじっくり浸るタイプです。', insight: '切ない音色や明るい音色を感情や情景に置き換える聴き方が表れています。', tip: 'イヤホンでメロディーや歌詞のフレーズひとつひとつを拾って、どんなストーリーの曲かを想像して聴いてみましょう。', character: atmosphereCharacter },
];

const startButton = document.querySelector('#start-quiz');
const restartButton = document.querySelector('#restart-quiz');
const home = document.querySelector('#home-screen');
const quiz = document.querySelector('#music-quiz');
const content = document.querySelector('#question-content');
const heading = document.querySelector('#question-heading');
const progressLabel = document.querySelector('.progress-label');
const progress = document.querySelector('.quiz-progress');
const options = document.querySelector('.quiz-options');
const errorMessage = document.querySelector('.quiz-error');
const previousButton = document.querySelector('#previous-question');
const nextButton = document.querySelector('#next-question');
const showResultButton = document.querySelector('#show-result');
const resultScreen = document.querySelector('#result-screen');
const resultType = document.querySelector('#result-type');
const resultDescription = document.querySelector('#result-description');
const resultQuestion = document.querySelector('.result-question');
const resultAnswer = document.querySelector('.result-answer');
const resultInsight = document.querySelector('.result-insight');
const resultListeningTip = document.querySelector('.result-listening-tip');
const resultCharacter = document.querySelector('.result-character');
const reviewButton = document.querySelector('#review-answers');
const songEntryScreen = document.querySelector('#song-entry-screen');
const songPreviewScreen = document.querySelector('#song-preview-screen');
const songFields = document.querySelector('#song-fields');
const shareCountInputs = [...document.querySelectorAll('input[name="share-count"]')];
const displayNameInput = document.querySelector('#display-name');
const entryError = document.querySelector('#song-entry-error');
const previewContent = document.querySelector('#song-preview-content');
const keepThemeChoice = document.querySelector('#keep-theme-choice');
const keepThemeSelect = document.querySelector('#keep-theme-select');
const previewResultType = document.querySelector('#preview-result-type');
const previewTypeIntro = document.querySelector('#preview-type-intro');
const discoveryScreen = document.querySelector('#discovery-screen');
const discoveryForm = document.querySelector('#discovery-form');
const discoveryResults = document.querySelector('#discovery-results');
const discoveryCards = document.querySelector('#discovery-cards');
const discoverySummary = document.querySelector('#discovery-summary');
const discoveryShare = document.querySelector('#copy-discovery-share');
const discoveryEdit = document.querySelector('#edit-discovery');
const discoveryHome = document.querySelector('#discovery-home');
const discoveryRefine = document.querySelector('#discovery-refine');
const discoveryControls = document.querySelector('#discovery-controls');
const themes = ['ここ最近で一番アツい曲', '元気を出したいとき', '落ち着きたいとき', 'つい歌いたくなるとき', 'ずっと好きな曲'];
const songDrafts = new Map(themes.map((theme) => [theme, { title: '', artist: '', links: {}, selection: null }]));
const searchState = new Map(themes.map((theme) => [theme, { timer: null, requestId: 0 }]));
let shareCount = 1;
let selectedThemesBeforeSingle = themes.slice(0, 3);
const answers = Array(questions.length).fill(null);
let currentQuestion = 0;
let isTransitioning = false;

function renderQuestion() {
  const item = questions[currentQuestion];
  heading.textContent = item.prompt;
  heading.id = `question-heading-${currentQuestion + 1}`;
  options.setAttribute('aria-labelledby', heading.id);
  progressLabel.textContent = `${currentQuestion + 1} / 6`;
  progress.setAttribute('aria-label', `全6問中の${currentQuestion + 1}問目`);
  progress.querySelectorAll('i').forEach((tick, index) => {
    tick.classList.toggle('is-current', index === currentQuestion);
    tick.classList.toggle('is-complete', index < currentQuestion);
  });
  options.replaceChildren(...item.answers.map((answer, index) => {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = `question-${currentQuestion + 1}`;
    input.value = String(index);
    input.checked = answers[currentQuestion] === index;
    input.addEventListener('change', () => {
      answers[currentQuestion] = index;
      errorMessage.hidden = true;
      errorMessage.textContent = '';
    });

    const marker = document.createElement('span');
    marker.className = 'track-marker';
    const number = document.createElement('span');
    number.className = 'track-number';
    number.textContent = `0${index + 1}`;
    const record = document.createElement('span');
    record.className = 'record-mark';
    record.setAttribute('aria-hidden', 'true');
    marker.append(number, record);

    const answerText = document.createElement('span');
    answerText.className = 'track-answer';
    answerText.textContent = answer;
    label.append(input, marker, answerText);
    return label;
  }));
  previousButton.hidden = currentQuestion === 0;
  nextButton.hidden = currentQuestion === questions.length - 1;
  showResultButton.hidden = currentQuestion !== questions.length - 1;
  errorMessage.hidden = true;
  errorMessage.textContent = '';
}

function renderSongFields() {
  const renderedThemes = [...songFields.querySelectorAll('.song-theme')].map((select) => select.value);
  const selectedThemes = shareCount === 1 && songFields.dataset.singleTheme
    ? [songFields.dataset.singleTheme]
    : shareCount === 3 && songFields.dataset.restoreThemes
      ? songFields.dataset.restoreThemes.split('|')
      : renderedThemes;
  const defaults = themes.filter((theme) => !selectedThemes.includes(theme)).slice(0, shareCount);
  delete songFields.dataset.restoreThemes;
  songFields.replaceChildren(...Array.from({ length: shareCount }, (_, index) => {
    const row = document.createElement('fieldset');
    row.className = 'song-field';
    const legend = document.createElement('legend');
    legend.textContent = `おすすめ曲 ${index + 1}`;
    const themeSelect = document.createElement('select');
    themeSelect.className = 'song-theme';
    themeSelect.setAttribute('aria-label', `おすすめ曲 ${index + 1}のテーマ`);
    themeSelect.innerHTML = themes.map((theme) => `<option>${theme}</option>`).join('');
    themeSelect.value = selectedThemes[index] || defaults[index] || themes[index];
    const usedThemes = selectedThemes.length ? selectedThemes : defaults;
    for (const option of themeSelect.options) {
      option.disabled = option.value !== themeSelect.value && usedThemes.includes(option.value);
    }
    const draft = songDrafts.get(themeSelect.value);
    row.append(legend, themeSelect);
    for (const [key, labelText, placeholder] of [['title', '曲名', '曲名を入力'], ['artist', 'アーティスト名', 'アーティスト名を入力']]) {
      const label = document.createElement('label');
      label.textContent = labelText;
      const input = document.createElement('input');
      input.type = 'text';
      input.value = draft[key];
      input.placeholder = placeholder;
      input.maxLength = 100;
      input.dataset.field = key;
      label.append(input);
      row.append(label);
    }
    const selectedArtwork = document.createElement('div');
    selectedArtwork.className = 'selected-artwork';
    row.append(selectedArtwork);
    const candidates = document.createElement('div');
    candidates.className = 'song-candidates';
    candidates.setAttribute('aria-live', 'polite');
    row.append(candidates);
    themeSelect.addEventListener('change', () => {
      if (shareCount === 1) songFields.dataset.singleTheme = themeSelect.value;
      renderSongFields();
    });
    row.querySelectorAll('input').forEach((input) => input.addEventListener('input', () => {
      const currentDraft = songDrafts.get(themeSelect.value);
      currentDraft[input.dataset.field] = input.value;
      currentDraft.selection?.controller?.abort();
      currentDraft.selection = null;
      currentDraft.links = {};
      renderSelectedArtwork(selectedArtwork, null);
      candidates.replaceChildren();
      scheduleTrackSearch(themeSelect.value, row);
    }));
    renderSelectedArtwork(selectedArtwork, draft.selection, draft);
    if (draft.selection) renderCandidates(candidates, draft.selection.results || [], themeSelect.value, row);
    else scheduleTrackSearch(themeSelect.value, row);
    return row;
  }));
}

function renderSelectedArtwork(container, selection, draft) {
  container.replaceChildren();
  container.classList.toggle('selected-song-card', Boolean(selection));
  if (!selection) return;
  const placeholder = document.createElement('span');
  placeholder.className = 'vinyl-placeholder';
  placeholder.setAttribute('aria-hidden', 'true');
  placeholder.hidden = Boolean(selection.artworkUrl);
  container.append(placeholder);
  if (selection.artworkUrl) {
    const image = document.createElement('img');
    image.className = 'selected-song-artwork';
    image.alt = '';
    image.addEventListener('error', () => { image.hidden = true; placeholder.hidden = false; });
    image.src = selection.artworkUrl;
    container.append(image);
  }
  const metadata = document.createElement('div');
  metadata.className = 'selected-song-metadata';
  const title = document.createElement('strong');
  title.className = 'song-title';
  title.textContent = draft.title;
  const artist = document.createElement('span');
  artist.className = 'song-artist';
  artist.textContent = draft.artist;
  metadata.append(title, artist);
  container.append(metadata, createServiceLinks(draft));
}

function scheduleTrackSearch(theme, row) {
  const title = row.querySelector('[data-field="title"]').value.trim();
  const artist = row.querySelector('[data-field="artist"]').value.trim();
  const state = searchState.get(theme);
  window.clearTimeout(state.timer);
  if (!title || !artist) return;
  const query = `${title} ${artist}`;
  state.timer = window.setTimeout(() => searchTracks(theme, query, row), 500);
}

async function searchTracks(theme, query, row) {
  const state = searchState.get(theme);
  const requestId = ++state.requestId;
  const resultsContainer = row.querySelector('.song-candidates');
  resultsContainer.textContent = '曲を検索しています…';
  const isCurrent = () => {
    const draft = songDrafts.get(theme);
    return row.isConnected && requestId === state.requestId && `${draft.title.trim()} ${draft.artist.trim()}` === query;
  };
  try {
    const results = await searchCatalogTracks(query);
    if (isCurrent()) renderCandidates(resultsContainer, results, theme, row);
  } catch (error) {
    if (!isCurrent()) return;
    console.warn('曲の候補を取得できませんでした。', error);
    resultsContainer.textContent = '候補を取得できませんでした。入力した曲名とアーティスト名はそのまま使えます。';
  }
}

function renderCandidates(container, results, theme, row) {
  container.replaceChildren();
  if (!results.length) {
    container.textContent = '候補が見つかりませんでした。入力した内容で続けられます。';
    return;
  }
  results.forEach((track) => {
    const candidate = document.createElement('article');
    candidate.className = 'song-candidate';
    const image = document.createElement('img');
    image.className = 'candidate-artwork';
    image.alt = '';
    const imageWrap = document.createElement('span');
    imageWrap.className = 'candidate-artwork-wrap';
    const placeholder = document.createElement('span');
    placeholder.className = 'vinyl-placeholder';
    placeholder.setAttribute('aria-hidden', 'true');
    placeholder.hidden = Boolean(track.artworkUrl100);
    if (track.artworkUrl100) {
      image.addEventListener('error', () => { image.hidden = true; placeholder.hidden = false; });
      image.src = track.artworkUrl100;
    } else {
      image.hidden = true;
      placeholder.hidden = false;
    }
    imageWrap.append(image, placeholder);
    candidate.append(imageWrap);
    const choose = document.createElement('button');
    choose.type = 'button';
    choose.className = 'candidate-choice';
    const songTitle = document.createElement('strong');
    songTitle.className = 'song-title';
    songTitle.textContent = track.trackName;
    const songArtist = document.createElement('span');
    songArtist.className = 'song-artist';
    songArtist.textContent = track.artistName;
    choose.append(songTitle, ' / ', songArtist, ` — ${track.collectionName || 'アルバム情報なし'}`);
    choose.addEventListener('click', () => {
      const draft = songDrafts.get(theme);
      draft.selection?.controller?.abort();
      draft.links = {};
      draft.title = track.trackName || draft.title;
      draft.artist = track.artistName || draft.artist;
      const appleUrl = appleTrackUrl(track);
      const selection = {
        trackId: track.trackId,
        albumName: track.collectionName || '',
        artworkUrl: track.artworkUrl100 || '',
        preview: getTrackPreview(track, appleUrl),
        isrc: track.isrc || '',
        links: savedServiceLinks({ appleMusic: appleUrl }),
        controller: new AbortController(),
        results,
      };
      draft.selection = selection;
      row.querySelector('[data-field="title"]').value = draft.title;
      row.querySelector('[data-field="artist"]').value = draft.artist;
      renderSelectedArtwork(row.querySelector('.selected-artwork'), draft.selection, draft);
      void loadSelectedLinks(theme, draft, selection);
    });
    candidate.append(choose);
    if (track.artworkUrl100 && track.trackViewUrl) {
      const storeLink = document.createElement('a');
      storeLink.className = 'itunes-badge-link';
      storeLink.href = track.trackViewUrl;
      storeLink.target = '_blank';
      storeLink.rel = 'noreferrer';
      storeLink.setAttribute('aria-label', 'iTunesでこの曲を見る');
      storeLink.textContent = 'iTunesで曲を見る';
      candidate.append(storeLink);
    }
    container.append(candidate);
  });
}

async function loadSelectedLinks(theme, draft, selection) {
  const signal = AbortSignal.any([selection.controller.signal, AbortSignal.timeout(5000)]);
  const links = await resolveServiceLinks(selection, signal).catch(() => ({}));
  if (draft.selection !== selection) return;
  selection.links = { ...links, ...selection.links };
  selection.controller = null;
  for (const row of songFields.querySelectorAll('.song-field')) {
    if (row.querySelector('.song-theme').value === theme) {
      row.querySelector('.selected-song-card > .song-service-links')?.replaceWith(createServiceLinks(draft));
    }
  }
  for (const card of previewContent.querySelectorAll('article')) {
    if (card.dataset.theme === theme) {
      card.querySelector('.song-service-links').replaceWith(createServiceLinks(draft));
    }
  }
}

function validateSongEntry() {
  const selectedThemes = [...songFields.querySelectorAll('.song-theme')].map((select) => select.value);
  if (new Set(selectedThemes).size !== shareCount) return '曲ごとに異なるテーマを選んでください。';
  for (const theme of selectedThemes) {
    const draft = songDrafts.get(theme);
    if (!draft.title.trim() || !draft.artist.trim()) return '曲名とアーティスト名を入力してください。';
    if (draft.title.trim().length > 100 || draft.artist.trim().length > 100) return '曲名とアーティスト名は100文字以内で入力してください。';
  }
  if (displayNameInput.value.trim().length > 30) return '表示名は30文字以内で入力してください。';
  return '';
}

function selectedSongs() {
  return [...songFields.querySelectorAll('.song-theme')].map(({ value: theme }) => ({ theme, ...songDrafts.get(theme) }));
}

function safeHttpsUrl(value) {
  if (typeof value !== 'string') return '';
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : '';
  } catch {
    return '';
  }
}

function renderSongPreview(songs, type = resultType.textContent, displayName = displayNameInput.value.trim(), shared = false) {
  stopSongPreview();
  if (shared) {
    songPreviewScreen.querySelector('h2').textContent = displayName ? `${displayName}さんのおすすめ曲` : 'おすすめ曲';
    previewResultType.textContent = `音楽タイプ：${type}`;
  } else {
    previewResultType.textContent = [displayName, `診断タイプ：${type}`].filter(Boolean).join('　');
  }
  const typeInfo = types.find(item => item.name === type);
  previewTypeIntro.hidden = !typeInfo;
  if (typeInfo) {
    const character = previewTypeIntro.querySelector('.share-type-character');
    character.src = typeInfo.character;
    character.alt = `${typeInfo.name}のキャラクター`;
    previewTypeIntro.querySelector('.share-type-description').textContent = typeInfo.shareDescription;
  }
  previewContent.replaceChildren(...songs.map(draft => createSongCard(draft, shared)));
  if (shared) songPreviewScreen.querySelector('h2').focus();
}

function createSongCard(draft, shared = false) {
  const card = document.createElement('article');
  card.className = 'song-preview-card';
  card.dataset.theme = draft.theme;
  const theme = document.createElement('p');
  theme.className = 'song-preview-theme';
  theme.textContent = draft.theme;
  const song = document.createElement('h3');
  song.className = 'song-title';
  song.textContent = draft.title.trim();
  const artist = document.createElement('p');
  artist.className = 'song-artist';
  artist.textContent = draft.artist.trim();
  const artwork = createCardArtwork(draft.title, draft.selection?.artworkUrl, shared);
  const info = document.createElement('div');
  info.className = 'song-preview-info';
  info.append(song, artist);
  const album = createCardAlbum(draft.title, draft.selection?.albumName, shared);
  if (album) info.append(album);
  if (draft.reason) {
    const reason = document.createElement('p');
    reason.className = 'discovery-reason';
    reason.textContent = draft.reason;
    info.append(reason);
  }
  if (draft.selection?.preview) info.append(createSongPreviewControls(draft.selection.preview));
  card.append(theme, artwork, info, createServiceLinks(draft));
  return card;
}

function createCardArtwork(title, url, shared) {
  const artworkWrap = document.createElement('div');
  artworkWrap.className = 'preview-artwork-wrap';
  const placeholder = document.createElement('span');
  placeholder.className = 'vinyl-placeholder';
  placeholder.setAttribute('aria-hidden', 'true');
  const safeUrl = safeHttpsUrl(url);
  const artworkUrl = shared ? largeCatalogArtwork(safeUrl) : safeUrl;
  placeholder.hidden = Boolean(artworkUrl);
  artworkWrap.append(placeholder);
  if (artworkUrl) {
    const image = document.createElement('img');
    image.className = 'preview-artwork';
    image.alt = `${title}のジャケット`;
    image.addEventListener('error', () => {
      if (artworkUrl !== safeUrl && image.src === artworkUrl) {
        image.src = safeUrl;
        return;
      }
      image.hidden = true;
      placeholder.hidden = false;
    });
    image.src = artworkUrl;
    artworkWrap.prepend(image);
  }
  return artworkWrap;
}

function createCardAlbum(title, name, shared) {
  if (typeof name !== 'string' || !name.trim()) return null;
  const normalize = value => value.normalize('NFKC').toLowerCase().replace(/\s+/gu, '');
  const suffix = /\s*[-–—]\s*(?:Single|EP)\s*$/i;
  const normalizedName = name.normalize('NFKC');
  if (shared && suffix.test(normalizedName) && normalize(normalizedName.replace(suffix, '')) === normalize(title)) return null;
  const album = document.createElement('p');
  album.className = 'song-preview-album';
  album.textContent = name;
  return album;
}

function quizSharePost() {
  const songs = selectedSongs().map(({ theme, title, artist, links, selection }) => ({
    theme, title: title.trim(), artist: artist.trim(), links: savedServiceLinks(links),
    selection: selection && {
      trackId: selection.trackId, albumName: selection.albumName, artworkUrl: selection.artworkUrl, isrc: selection.isrc,
      links: selection.links, pending: Boolean(selection.controller),
    },
  }));
  const type = resultType.textContent;
  const displayName = displayNameInput.value.trim();
  const lines = ['【MACHA-TUNE診断結果】'];
  if (displayName) lines.push(`${displayName}さんの`);
  lines.push(`音楽を聴くときのタイプは「${type}」でした`, '', 'おすすめの曲はこちら！', '');
  return sharePost('diagnosis', { type, displayName, songs }, lines);
}

function appHomeUrl() {
  return new URL(import.meta.env.BASE_URL, location.origin);
}

function sharePost(source, payload, lines) {
  const url = new URL(sharePages[source].path, appHomeUrl());
  url.hash = new URLSearchParams({ share: JSON.stringify(payload) }).toString();
  return [...lines, url.href].join('\n');
}

async function copySharePost(post, message, status) {
  message.value = post;
  message.hidden = false;
  try {
    await navigator.clipboard.writeText(post);
    status.textContent = 'Slack用の投稿文をコピーしました。';
  } catch {
    message.select();
    status.textContent = '選択した投稿文をコピーしてください。';
  }
  status.hidden = false;
}

function showSharedHomeAction(cards) {
  const action = document.querySelector('#shared-home-action').content.cloneNode(true);
  action.querySelector('a').href = appHomeUrl();
  cards.after(action);
}

async function showSharedSongs(payload) {
  stopSongPreview();
  home.hidden = true;
  quiz.hidden = true;
  resultScreen.hidden = true;
  songEntryScreen.hidden = true;
  discoveryScreen.hidden = true;
  closeDiscoveryResults();
  songPreviewScreen.hidden = false;
  songPreviewScreen.classList.add('shared-song-layout');
  songPreviewScreen.querySelector('h2').textContent = 'おすすめ曲';
  document.querySelector('#share-actions').hidden = true;
  document.querySelector('.shared-home-action')?.remove();
  previewContent.replaceChildren();
  try {
    const data = JSON.parse(payload);
    if (data.kind === 'discovery') {
      validateDiscoveryShare(data);
      songPreviewScreen.hidden = true;
      renderDiscoveryResults(data, true);
      showSharedHomeAction(discoveryCards);
      return;
    }
    const { type, displayName = '', songs } = data;
    if (typeof type !== 'string' || typeof displayName !== 'string' || !Array.isArray(songs) || ![1, 3].includes(songs.length)
      || !songs.every(song => song && [song.theme, song.title, song.artist].every(value => typeof value === 'string'))) {
      throw new Error('Invalid share');
    }
    // Shared payloads can contain an ID, or an exact Apple Music track link on older URLs.
    // Obtain audio from the catalogue rather than trusting a playable URL in the payload.
    for (const song of songs) {
      if (song.selection) delete song.selection.preview;
    }
    renderSongPreview(songs, type, displayName.trim(), true);
    showSharedHomeAction(previewContent);
    const cards = [...previewContent.children];
    const refreshLinks = songs.map(async (song, index) => {
      if (!song.selection?.pending) return;
      const selection = { isrc: song.selection.isrc, links: savedServiceLinks(song.selection.links) };
      const links = await resolveServiceLinks(selection, AbortSignal.timeout(5000)).catch(() => ({}));
      song.selection.links = { ...links, ...selection.links };
      if (cards[index].isConnected && Object.keys(links).length) {
        const previous = cards[index].querySelector('.song-service-links');
        const focusedIndex = [...previous.children].indexOf(document.activeElement);
        const updated = createServiceLinks(song);
        previous.replaceWith(updated);
        updated.children[focusedIndex]?.focus({ preventScroll: true });
      }
    });
    await Promise.all([...refreshLinks, restoreSharedCatalog(songs, cards)]);
  } catch {
    previewResultType.textContent = '共有リンクを読み込めませんでした。';
  }
}

async function restoreSharedCatalog(songs, cards) {
  const ids = songs.map(({ selection }) => songTrackId(selection?.trackId) || appleTrackId(selection?.links?.appleMusic));
  if (!ids.some(Boolean)) return;
  const metadata = await lookupCatalogTracks(ids.filter(Boolean), AbortSignal.timeout(8000)).catch(() => new Map());
  songs.forEach((song, index) => hydrateSharedCard(cards[index], song, metadata.get(ids[index])));
}

function hydrateSharedCard(card, song, metadata) {
  if (!card.isConnected || !metadata) return;
  const artwork = card.querySelector('.preview-artwork-wrap');
  if (!song.selection?.artworkUrl && metadata.artworkUrl) {
    artwork.replaceWith(createCardArtwork(song.title, metadata.artworkUrl, true));
  }
  if (!song.selection?.albumName) {
    const album = createCardAlbum(song.title, metadata.albumName, true);
    if (album) card.querySelector('.song-artist').after(album);
  }
  if (metadata.preview) {
    card.querySelector('.song-preview-info').append(createSongPreviewControls(metadata.preview, '▶ 試聴する'));
  }
}

const anyGenre = document.querySelector('#discovery-any-genre');
const genreOptions = document.querySelector('#discovery-genres');
const extraGenres = document.querySelector('#discovery-extra-genres');
const selectedGenres = document.querySelector('#discovery-selected-genres');
const discoveryShareActions = document.querySelector('#discovery-share-actions');
const discoveryMessage = document.querySelector('#discovery-share-message');
const discoveryStatus = document.querySelector('#discovery-share-status');
let discoveryRequest;
let discoveryShareData;

function discoveryOption(name, value, type, checked = false) {
  const input = document.createElement('input');
  input.name = name;
  input.type = type;
  input.value = value;
  input.checked = checked;
  const label = document.createElement('label');
  label.append(input, value);
  return label;
}

genreOptions.append(...mainGenres.map(genre => discoveryOption('genre', genre, 'checkbox')));
for (const group of extraGenreGroups) {
  const fieldset = document.createElement('fieldset');
  const legend = document.createElement('legend');
  legend.textContent = group.name;
  const options = document.createElement('div');
  options.className = 'discovery-options';
  options.append(...group.genres.map(genre => discoveryOption('genre', genre, 'checkbox')));
  fieldset.append(legend, options);
  extraGenres.append(fieldset);
}
document.querySelector('#discovery-regions').append(
  ...regions.map((region, index) => discoveryOption('region', region, 'radio', index === 0)));

function updateGenreSelection() {
  const selected = new FormData(discoveryForm).getAll('genre');
  anyGenre.setAttribute('aria-pressed', String(selected.length === 0));
  selectedGenres.textContent = `選択中：${formatDiscoveryGenres(selected)}`;
}

discoveryForm.addEventListener('change', event => {
  if (event.target.name === 'genre') updateGenreSelection();
});
anyGenre.addEventListener('click', () => {
  for (const input of discoveryForm.querySelectorAll('[name="genre"]:checked')) input.checked = false;
  updateGenreSelection();
});

function openDiscovery() {
  if (discoveryControls.parentElement !== discoveryScreen) discoveryScreen.append(discoveryControls);
  home.hidden = true;
  discoveryScreen.hidden = false;
  document.querySelector('#discovery-heading').focus();
}

function closeDiscoveryResults() {
  discoveryRequest?.abort();
  discoveryResults.hidden = true;
  discoveryShareData = undefined;
  stopSongPreview();
}

function validateDiscoveryShare(data) {
  if (!Array.isArray(data.genres) || !data.genres.every(genre => typeof genre === 'string')
    || typeof data.region !== 'string' || !Array.isArray(data.songs) || data.songs.length < 1 || data.songs.length > 3
    || !data.songs.every(song => song && Number.isSafeInteger(song.id) && song.id > 0
      && [song.title, song.artist, song.genre, song.reason].every(value => typeof value === 'string'))) {
    throw new Error('Invalid discovery share');
  }
}

function renderDiscoveryResults(data, shared = false) {
  closeDiscoveryResults();
  discoveryScreen.hidden = true;
  discoveryResults.hidden = false;
  discoveryResults.classList.toggle('shared-song-layout', shared);
  const heading = document.querySelector('#discovery-result-heading');
  heading.textContent = shared ? 'MACHA-TUNEで見つけた曲' : 'あなたへのおすすめ';
  discoveryShareData = data;
  const { songs, region } = data;
  const count = songs.length;
  discoveryShareActions.hidden = shared || count === 0;
  discoveryEdit.hidden = shared;
  discoveryEdit.textContent = count ? '選択を変更する' : '別のジャンルで探す';
  discoveryMessage.hidden = true;
  discoveryStatus.hidden = true;
  discoveryShare.textContent = `この${count}曲をSlackで共有`;
  const summary = `${formatDiscoveryGenres(data.genres)} / ${region}`;
  discoverySummary.textContent = shared ? (region === regions[0] ? formatDiscoveryGenres(data.genres) : summary)
    : count ? summary : `${summary}　この組み合わせの曲はまだ見つかりませんでした`;
  if (!count) discoveryRefine.append(discoveryControls);
  else if (discoveryControls.parentElement !== discoveryScreen) discoveryScreen.append(discoveryControls);
  const renderCards = (metadata = new Map()) => {
    discoveryCards.replaceChildren(...songs.map(song => createSongCard({
      ...song,
      theme: song.genre,
      selection: { links: { appleMusic: appleTrackUrl({ trackId: song.id }) }, ...metadata.get(String(song.id)) },
    }, shared)));
  };
  renderCards();
  const cards = [...discoveryCards.children];
  heading.focus();
  if (!count) return;
  const request = new AbortController();
  discoveryRequest = request;
  const signal = AbortSignal.any([request.signal, AbortSignal.timeout(8000)]);
  void lookupCatalogTracks(songs.map(song => song.id), signal).then(metadata => {
    if (request.signal.aborted) return;
    if (shared) songs.forEach((song, index) => hydrateSharedCard(cards[index], song, metadata.get(String(song.id))));
    else renderCards(metadata);
  }).catch(() => {});
}

document.querySelector('#open-discovery').addEventListener('click', openDiscovery);
discoveryHome.addEventListener('click', () => {
  closeDiscoveryResults();
  discoveryScreen.hidden = true;
  home.hidden = false;
  document.querySelector('#open-discovery').focus();
});
discoveryEdit.addEventListener('click', () => {
  if (discoveryControls.parentElement === discoveryRefine) {
    discoveryForm.querySelector('[name="genre"]').focus();
    return;
  }
  closeDiscoveryResults();
  openDiscovery();
});
discoveryForm.addEventListener('submit', event => {
  event.preventDefault();
  const form = new FormData(discoveryForm);
  const selected = form.getAll('genre');
  const region = form.get('region');
  const songs = recommendSongs(selected, region, readRegisteredSongs());
  renderDiscoveryResults({ kind: 'discovery', genres: selected, region, songs });
});
discoveryShare.addEventListener('click', () => {
  const { genres: selected } = discoveryShareData;
  const post = sharePost('discovery', discoveryShareData, [
    '【MACHA-TUNEで見つけた楽曲】',
    `ジャンル：${formatDiscoveryGenres(selected)}`,
  ]);
  void copySharePost(post, discoveryMessage, discoveryStatus);
});

function moveToQuestion(nextIndex, direction) {
  if (isTransitioning || nextIndex < 0 || nextIndex >= questions.length) return;
  isTransitioning = true;
  content.classList.remove('enter-from-left', 'enter-from-right');
  content.classList.add('is-leaving');
  window.setTimeout(() => {
    currentQuestion = nextIndex;
    renderQuestion();
    content.classList.remove('is-leaving');
    content.classList.add(direction === 'next' ? 'enter-from-right' : 'enter-from-left');
    window.requestAnimationFrame(() => content.classList.remove('enter-from-left', 'enter-from-right'));
    isTransitioning = false;
  }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 200);
}

startButton.addEventListener('click', () => {
  currentQuestion = 0;
  quiz.hidden = false;
  home.hidden = true;
  renderQuestion();
  quiz.classList.remove('quiz-entering');
  window.requestAnimationFrame(() => quiz.classList.add('quiz-entering'));
  heading.focus();
});

function getResultTypeIndex() {
  const scores = [0, 0, 0, 0];
  answers.forEach((answerIndex) => { scores[answerIndex] += 1; });
  const highestScore = Math.max(...scores);
  const tiedTypes = scores.map((score, typeIndex) => score === highestScore ? typeIndex : -1).filter((typeIndex) => typeIndex >= 0);
  return answers.find((answerIndex) => tiedTypes.includes(answerIndex));
}

function showResult() {
  const typeIndex = getResultTypeIndex();
  const supportingQuestion = answers.findIndex((answerIndex) => answerIndex === typeIndex);
  const answerText = questions[supportingQuestion].answers[answers[supportingQuestion]];
  resultType.innerHTML = types[typeIndex].name.replace(/タイプ$/, '<span class="type-ending">タイプ</span>');
  resultDescription.textContent = types[typeIndex].description;
  resultQuestion.textContent = questions[supportingQuestion].prompt;
  resultAnswer.textContent = `「${answerText}」`;
  resultInsight.textContent = types[typeIndex].insight;
  resultListeningTip.textContent = types[typeIndex].tip;
  resultCharacter.src = types[typeIndex].character;
  resultCharacter.alt = `${types[typeIndex].name}のキャラクター`;
  quiz.hidden = true;
  resultScreen.hidden = false;
  resultScreen.classList.remove('result-entering');
  window.requestAnimationFrame(() => resultScreen.classList.add('result-entering'));
  resultType.focus();
}

showResultButton.addEventListener('click', () => {
  if (answers.some((answer) => answer === null) || isTransitioning) return;
  showResult();
});

reviewButton.addEventListener('click', () => {
  currentQuestion = questions.length - 1;
  resultScreen.hidden = true;
  quiz.hidden = false;
  renderQuestion();
  heading.focus();
});

document.querySelector('#open-song-entry').addEventListener('click', () => {
  resultScreen.hidden = true;
  songEntryScreen.hidden = false;
  renderSongFields();
});

shareCountInputs.forEach((input) => input.addEventListener('change', () => {
  if (Number(input.value) === 1 && shareCount === 3) {
    selectedThemesBeforeSingle = [...songFields.querySelectorAll('.song-theme')].map((select) => select.value);
    keepThemeSelect.replaceChildren(...selectedThemesBeforeSingle.map((theme) => new Option(theme, theme)));
    keepThemeChoice.hidden = false;
    return;
  }
  shareCount = Number(input.value);
  if (shareCount === 3 && selectedThemesBeforeSingle.length === 3) {
    songFields.dataset.restoreThemes = selectedThemesBeforeSingle.join('|');
  }
  renderSongFields();
}));

document.querySelector('#confirm-count-change').addEventListener('click', () => {
  const chosenTheme = keepThemeSelect.value;
  songFields.dataset.singleTheme = chosenTheme;
  shareCount = 1;
  shareCountInputs.find((input) => input.value === '1').checked = true;
  keepThemeChoice.hidden = true;
  renderSongFields();
});

document.querySelector('#cancel-count-change').addEventListener('click', () => {
  shareCountInputs.find((input) => input.value === '3').checked = true;
  keepThemeChoice.hidden = true;
});

document.querySelector('#preview-share').addEventListener('click', () => {
  entryError.textContent = validateSongEntry();
  entryError.hidden = !entryError.textContent;
  if (entryError.hidden) {
    document.querySelector('#share-message').hidden = true;
    document.querySelector('#share-status').hidden = true;
    const songs = selectedSongs();
    saveRegisteredSongs(songs);
    renderSongPreview(songs);
    songEntryScreen.hidden = true;
    songPreviewScreen.hidden = false;
  }
});

document.querySelector('#copy-slack-share').addEventListener('click', () => {
  void copySharePost(quizSharePost(), document.querySelector('#share-message'), document.querySelector('#share-status'));
});

document.querySelector('#edit-songs').addEventListener('click', () => {
  stopSongPreview();
  songPreviewScreen.hidden = true;
  songEntryScreen.hidden = false;
});

document.querySelector('#back-to-result').addEventListener('click', () => {
  songEntryScreen.hidden = true;
  resultScreen.hidden = false;
});

document.querySelector('#preview-back-result').addEventListener('click', () => {
  stopSongPreview();
  songPreviewScreen.hidden = true;
  resultScreen.hidden = false;
});

nextButton.addEventListener('click', () => {
  if (isTransitioning) return;
  if (answers[currentQuestion] === null) {
    errorMessage.textContent = 'ひとつ選んでね';
    errorMessage.hidden = false;
    return;
  }
  moveToQuestion(currentQuestion + 1, 'next');
});

function openShareFromUrl() {
  const payload = new URLSearchParams(location.hash.slice(1)).get('share');
  if (payload !== null) void showSharedSongs(payload);
  else if (document.querySelector('#share-actions').hidden) location.reload();
}

openShareFromUrl();
window.addEventListener('hashchange', openShareFromUrl);
window.addEventListener('pagehide', stopSongPreview);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopSongPreview();
});

previousButton.addEventListener('click', () => moveToQuestion(currentQuestion - 1, 'previous'));

restartButton.addEventListener('click', () => {
  const shouldRestart = window.confirm('回答を消して、1問目からやり直しますか？');
  if (!shouldRestart) return;
  answers.fill(null);
  currentQuestion = 0;
  quiz.hidden = true;
  resultScreen.hidden = true;
  home.hidden = false;
  startButton.focus();
});
