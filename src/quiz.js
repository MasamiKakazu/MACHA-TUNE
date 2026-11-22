const questions = [
  {
    prompt: '初めて聴く曲、最初に耳に残るのは？',
    answers: ['印象的な一言', 'サビの旋律', 'ドラムやベースの刻み', '声や楽器の響き'],
  },
  {
    prompt: 'もう一度再生したくなるのは？',
    answers: ['歌詞の意味を確かめたいとき', '口ずさみたいフレーズがあるとき', 'あのビートにもう一度乗りたいとき', '曲の空気に浸りたいとき'],
  },
  {
    prompt: '人にすすめるなら、どこを聴いてほしい？',
    answers: ['自分に刺さった言葉', 'サビに入る瞬間の音の流れ', '思わず体が動くところ', 'イントロで景色が浮かぶところ'],
  },
  {
    prompt: '歌詞のない曲を聴くときは？',
    answers: ['曲に合いそうな物語を想像する', '主旋律を追いかける', '拍をとる', '楽器の音色に耳を澄ます'],
  },
  {
    prompt: 'ライブで一番楽しみなのは？',
    answers: ['好きな歌詞を生で聴く瞬間', 'みんなでサビを歌う瞬間', '会場全体で手拍子する瞬間', '音に包まれる瞬間'],
  },
  {
    prompt: '聴き終わったあとに残るのは？',
    answers: ['自分に重なる言葉', '頭の中で流れる旋律', '自然と刻んでしまうテンポ', 'その曲が連れてきた気分'],
  },
];
const types = [
  { id: 'lyrics', name: '言葉に惹かれるタイプ', description: '何気ない一言が自分の記憶と重なる瞬間、歌詞の奥にある物語まで聴きたくなるタイプです。ふと耳にしたフレーズを、あとから何度も思い返すことがあります。', insight: '言葉の意味や背景を確かめながら、曲に込められた気持ちを受け取る聴き方が表れています。', tip: '同じサビを1番と最後で聴き比べて、歌詞の景色がどう変わるか味わってみましょう。', character: '/src/assets/charactors/lyrics.png' },
  { id: 'melody', name: '口ずさみたいメロディー派', description: '帰り道にサビの数音が口からこぼれる瞬間、旋律がその日の気分に寄り添います。歌いたくなるフレーズを何度もたどるうちに、曲が自分のものになっていきます。', insight: '旋律を追い、口ずさみたくなるフレーズを見つける聴き方が表れています。', tip: '同じ曲の弾き語り版で、歌声に隠れていた旋律の動きを追ってみましょう。', character: '/src/assets/charactors/melody.png' },
  { id: 'rhythm', name: 'ビートに乗るタイプ', description: '好きだと気づく前に指が拍を刻む瞬間、ビートが自然と体に届いています。ドラムやベースの重なりが、曲をもう一度聴きたくなる合図になります。', insight: '拍やビートの手触りを頼りに、体でリズムを受け取る聴き方が表れています。', tip: 'ライブ版で手拍子とドラムの重なりに耳を向けてみましょう。', character: '/src/assets/charactors/rhythm.png' },
  { id: 'atmosphere', name: '音の世界に浸るタイプ', description: 'イントロの音色だけで景色が浮かぶ瞬間、声や楽器の響きが曲の世界へ連れていきます。音の余韻や空気ごと味わうことで、その曲ならではの風景が広がります。', insight: '音色や響きから曲の景色を想像し、空気ごと味わう聴き方が表れています。', tip: 'イヤホンでイントロの奥にある音をひとつ探して、どんな景色を連れてくるか聴いてみましょう。', character: '/src/assets/charactors/atmosphere.png' },
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
const themes = ['ここ最近で一番アツい曲', '元気を出したいとき', '落ち着きたいとき', 'つい歌いたくなるとき', 'ずっと好きな曲'];
const songDrafts = new Map(themes.map((theme) => [theme, { title: '', artist: '', links: { spotify: '', appleMusic: '', youtubeMusic: '' }, selection: null }]));
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
    const draft = songDrafts.get(themeSelect.value);
    row.append(legend, themeSelect);
    for (const [key, labelText, placeholder] of [['title', '曲名', '曲名を入力'], ['artist', 'アーティスト名', 'アーティスト名を入力']]) {
      const label = document.createElement('label');
      label.textContent = labelText;
      const input = document.createElement('input');
      input.type = 'text';
      input.value = draft[key];
      input.placeholder = placeholder;
      input.maxLength = key === 'url' ? 2048 : 100;
      input.dataset.field = key;
      label.append(input);
      row.append(label);
    }
    const linkDetails = document.createElement('details');
    linkDetails.className = 'song-link-details';
    const linkSummary = document.createElement('summary');
    linkSummary.textContent = '曲のリンクを追加（任意）';
    linkDetails.append(linkSummary);
    for (const [serviceKey, serviceName] of [['spotify', 'Spotify'], ['appleMusic', 'Apple Music'], ['youtubeMusic', 'YouTube Music']]) {
      const linkLabel = document.createElement('label');
      linkLabel.textContent = `${serviceName}の曲リンク（任意）`;
      const linkInput = document.createElement('input');
      linkInput.type = 'url';
      linkInput.value = draft.links[serviceKey];
      linkInput.placeholder = 'https://';
      linkInput.maxLength = 2048;
      linkInput.dataset.linkService = serviceKey;
      linkLabel.append(linkInput);
      linkDetails.append(linkLabel);
    }
    row.append(linkDetails);
    const selectedArtwork = document.createElement('div');
    selectedArtwork.className = 'selected-artwork';
    row.append(selectedArtwork);
    const candidates = document.createElement('div');
    candidates.className = 'song-candidates';
    candidates.setAttribute('aria-live', 'polite');
    row.append(candidates);
    themeSelect.addEventListener('change', () => {
      saveSongDrafts();
      renderSongFields();
    });
    row.querySelectorAll('input').forEach((input) => input.addEventListener('input', () => {
      const currentDraft = songDrafts.get(themeSelect.value);
      if (input.dataset.linkService) currentDraft.links[input.dataset.linkService] = input.value;
      else currentDraft[input.dataset.field] = input.value;
      if (input.dataset.field === 'title' || input.dataset.field === 'artist') {
        currentDraft.selection = null;
        renderSelectedArtwork(selectedArtwork, null);
      candidates.textContent = '入力を待っています…';
        scheduleTrackSearch(themeSelect.value, row);
      }
    }));
    renderSelectedArtwork(selectedArtwork, draft.selection);
    if (draft.selection) renderCandidates(candidates, draft.selection.results || [], themeSelect.value, row);
    scheduleTrackSearch(themeSelect.value, row);
    return row;
  }));
}

function createServiceLinks(draft) {
  const links = document.createElement('div');
  links.className = 'song-service-links';
  const searchTerm = `${draft.title.trim()} ${draft.artist.trim()}`;
  const services = [
    { key: 'spotify', name: 'Spotify', searchUrl: `https://open.spotify.com/search/${encodeURIComponent(searchTerm)}` },
    { key: 'appleMusic', name: 'Apple Music', searchUrl: `https://music.apple.com/jp/search?term=${encodeURIComponent(searchTerm)}` },
    { key: 'youtubeMusic', name: 'YouTube Music', searchUrl: `https://music.youtube.com/search?q=${encodeURIComponent(searchTerm)}` },
  ];
  services.forEach((service) => {
    const hasTrackLink = Boolean(draft.links[service.key].trim());
    const link = document.createElement('a');
    link.className = `song-service-link service-${service.key}`;
    link.href = hasTrackLink ? draft.links[service.key].trim() : service.searchUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = `${service.name}で${hasTrackLink ? '開く' : '検索'}`;
    link.setAttribute('aria-label', `${service.name}で${draft.title.trim()}を${hasTrackLink ? '開く' : '検索'}`);
    links.append(link);
  });
  return links;
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
  if (!selection?.artworkUrl) return;
  const image = document.createElement('img');
  image.className = 'selected-song-artwork';
  image.alt = '';
  image.src = selection.artworkUrl;
  image.addEventListener('load', () => { placeholder.hidden = true; });
  image.addEventListener('error', () => { image.hidden = true; placeholder.hidden = false; });
  container.append(image);
  const metadata = document.createElement('div');
  metadata.className = 'selected-song-metadata';
  const title = document.createElement('strong');
  title.textContent = draft.title;
  const artist = document.createElement('span');
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
  const params = new URLSearchParams({ term: query, country: 'jp', media: 'music', entity: 'song', limit: '8' });
  try {
    const response = await fetch(`https://itunes.apple.com/search?${params}`);
    if (!response.ok) throw new Error('Search failed');
    const data = await response.json();
    const currentDraft = songDrafts.get(theme);
    if (requestId !== state.requestId || `${currentDraft.title.trim()} ${currentDraft.artist.trim()}` !== query) return;
    renderCandidates(resultsContainer, data.results || [], theme, row);
  } catch {
    if (requestId === state.requestId) resultsContainer.textContent = '候補を取得できませんでした。入力した曲名とアーティスト名はそのまま使えます。';
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
      image.src = track.artworkUrl100;
      image.addEventListener('load', () => { placeholder.hidden = true; });
      image.addEventListener('error', () => { image.hidden = true; placeholder.hidden = false; });
    } else {
      image.hidden = true;
      placeholder.hidden = false;
    }
    imageWrap.append(image, placeholder);
    candidate.append(imageWrap);
    const choose = document.createElement('button');
    choose.type = 'button';
    choose.className = 'candidate-choice';
    choose.textContent = `${track.trackName} / ${track.artistName} — ${track.collectionName || 'アルバム情報なし'}`;
    choose.addEventListener('click', () => {
      const draft = songDrafts.get(theme);
      draft.title = track.trackName || draft.title;
      draft.artist = track.artistName || draft.artist;
      draft.selection = {
        trackName: track.trackName,
        artistName: track.artistName,
        albumName: track.collectionName || '',
        artworkUrl: track.artworkUrl100 || '',
        itunesUrl: track.trackViewUrl || track.collectionViewUrl || '',
        results,
      };
      row.querySelector('[data-field="title"]').value = draft.title;
      row.querySelector('[data-field="artist"]').value = draft.artist;
      renderSelectedArtwork(row.querySelector('.selected-artwork'), draft.selection, draft);
      renderCandidates(container, results, theme, row);
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

function saveSongDrafts() {
  songFields.querySelectorAll('.song-field').forEach((row) => {
    const theme = row.querySelector('.song-theme').value;
    row.querySelectorAll('input').forEach((input) => {
      if (input.dataset.linkService) songDrafts.get(theme).links[input.dataset.linkService] = input.value;
      else songDrafts.get(theme)[input.dataset.field] = input.value;
    });
  });
}

function validateSongEntry() {
  saveSongDrafts();
  const selectedThemes = [...songFields.querySelectorAll('.song-theme')].map((select) => select.value);
  if (new Set(selectedThemes).size !== shareCount) return '曲ごとに異なるテーマを選んでください。';
  for (const theme of selectedThemes) {
    const draft = songDrafts.get(theme);
    if (!draft.title.trim() || !draft.artist.trim()) return '曲名とアーティスト名を入力してください。';
    if (draft.title.trim().length > 100 || draft.artist.trim().length > 100) return '曲名とアーティスト名は100文字以内で入力してください。';
    const allowedHosts = { spotify: ['open.spotify.com', 'spotify.link'], appleMusic: ['music.apple.com'], youtubeMusic: ['music.youtube.com', 'www.youtube.com', 'youtube.com', 'youtu.be'] };
    for (const [service, value] of Object.entries(draft.links)) {
      if (!value.trim()) continue;
      try {
        const url = new URL(value.trim());
        if (url.protocol !== 'https:' || !allowedHosts[service].some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))) return '曲のリンクは各サービスのHTTPS URLを入力してください。';
      } catch { return '曲のリンクの形式を確認してください。'; }
    }
  }
  if (displayNameInput.value.trim().length > 30) return '表示名は30文字以内で入力してください。';
  return '';
}

function renderSongPreview() {
  saveSongDrafts();
  const selectedThemes = [...songFields.querySelectorAll('.song-theme')].map((select) => select.value);
  previewResultType.textContent = `診断タイプ：${resultType.textContent}`;
  previewContent.replaceChildren(...selectedThemes.map((theme) => {
    const card = document.createElement('article');
    const draft = songDrafts.get(theme);
    const title = document.createElement('h3');
    title.textContent = theme;
    const song = document.createElement('p');
    song.textContent = draft.title.trim();
    const artist = document.createElement('p');
    artist.textContent = draft.artist.trim();
    const artworkWrap = document.createElement('div');
    artworkWrap.className = 'preview-artwork-wrap';
    const placeholder = document.createElement('span');
    placeholder.className = 'vinyl-placeholder';
    placeholder.setAttribute('aria-hidden', 'true');
    placeholder.hidden = Boolean(draft.selection?.artworkUrl);
    artworkWrap.append(placeholder);
    if (draft.selection?.artworkUrl) {
      const image = document.createElement('img');
      image.className = 'preview-artwork';
      image.alt = `${draft.selection.albumName || draft.title}のジャケット`;
      image.src = draft.selection.artworkUrl;
      image.addEventListener('load', () => { placeholder.hidden = true; });
      image.addEventListener('error', () => { image.hidden = true; placeholder.hidden = false; });
      artworkWrap.prepend(image);
      if (draft.selection.itunesUrl) {
        const badge = document.createElement('a');
        badge.className = 'itunes-badge-link';
        badge.href = draft.selection.itunesUrl;
        badge.target = '_blank';
        badge.rel = 'noreferrer';
        badge.textContent = 'iTunesで曲を見る';
        artworkWrap.append(badge);
      }
    }
    const album = document.createElement('p');
    album.textContent = draft.selection?.albumName || '';
    const serviceLinks = createServiceLinks(draft);
    card.append(title, artworkWrap, song, artist, album, serviceLinks);
    return card;
  }));
}

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
    saveSongDrafts();
    selectedThemesBeforeSingle = [...songFields.querySelectorAll('.song-theme')].map((select) => select.value);
    keepThemeSelect.replaceChildren(...selectedThemesBeforeSingle.map((theme) => new Option(theme, theme)));
    keepThemeChoice.hidden = false;
    return;
  }
  saveSongDrafts();
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
    renderSongPreview();
    songEntryScreen.hidden = true;
    songPreviewScreen.hidden = false;
  }
});

document.querySelector('#edit-songs').addEventListener('click', () => {
  songPreviewScreen.hidden = true;
  songEntryScreen.hidden = false;
});

document.querySelector('#back-to-result').addEventListener('click', () => {
  songEntryScreen.hidden = true;
  resultScreen.hidden = false;
});

document.querySelector('#preview-back-result').addEventListener('click', () => {
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
