import { songKey, songTrackId } from './song-history.js';

const genre = {
  jpop: 'J-POP', kpop: 'K-POP', pop: 'ポップ', rock: 'ロック',
  idol: 'アイドルソング', ballad: 'バラード', dance: 'ダンス曲', acoustic: '弾き語り',
  hiphop: 'ヒップホップ', rnb: 'R&B', edm: 'EDM', house: 'ハウス',
  alternative: 'オルタナティブロック', indie: 'インディーロック', punk: 'パンク', metal: 'メタル',
  electro: 'エレクトロ', techno: 'テクノ', trance: 'トランス', dnb: 'ドラムンベース', disco: 'ディスコ',
  funk: 'ファンク', soul: 'ソウル', jazz: 'ジャズ', blues: 'ブルース', reggae: 'レゲエ',
  citypop: 'シティポップ', dancepop: 'ダンスポップ', folk: 'フォーク', bossa: 'ボサノヴァ', classical: 'クラシック',
};
const mood = { lofi: 'Lo-Fi' };

export const mainGenres = [
  genre.jpop, genre.kpop, genre.pop, genre.rock, genre.hiphop, genre.rnb, genre.edm, genre.house,
  genre.idol, genre.ballad, genre.dance, genre.acoustic,
];
export const extraGenreGroups = [
  { name: 'バンド系', genres: [genre.alternative, genre.indie, genre.punk, genre.metal] },
  { name: 'ダンス・電子音楽', genres: [genre.electro, genre.techno, genre.trance, genre.dnb, genre.disco] },
  { name: 'グルーヴ・ルーツ系', genres: [genre.funk, genre.soul, genre.jazz, genre.blues, genre.reggae] },
  { name: 'ポップ・その他', genres: [genre.citypop, genre.dancepop, genre.folk, genre.bossa, genre.classical] },
  { name: '音の雰囲気', genres: [mood.lofi] },
];
export const regions = ['どちらでも', '国内', '海外'];

// Use one Apple catalogue track ID per song and classify by the artist's scene.
const catalog = [
  { id: 1499615822, title: 'KissHug', artist: 'aiko', tags: [genre.jpop, genre.pop], region: '国内', reason: 'ピアノと歌声がゆっくり重なる、メロディをじっくり味わえる一曲。' },
  { id: 1039793121, title: '新宝島', artist: 'サカナクション', tags: [genre.jpop, genre.rock, genre.dancepop], region: '国内', reason: 'シンセのフレーズと弾むリズムが耳に残る一曲。' },
  { id: 1109986324, title: 'カブトムシ', artist: 'aiko', tags: [genre.jpop, genre.pop], region: '国内', reason: '柔らかな歌い出しから、サビに向けて声が伸びていく一曲。' },
  { id: 1465863819, title: '天体観測', artist: 'BUMP OF CHICKEN', tags: [genre.rock, genre.jpop], region: '国内', reason: 'イントロのギターから一気に走り出す、バンドの勢いが伝わる一曲。' },
  { id: 362133505, title: 'Everlong', artist: 'Foo Fighters', tags: [genre.rock, genre.alternative], region: '海外', reason: '重なるギターと力強いドラムが、サビに向けて熱を高めます。' },
  { id: 1564752145, title: 'きらり', artist: '藤井 風', tags: [genre.pop, genre.jpop, genre.dancepop], region: '国内', reason: '軽快なビートと伸びやかな歌声を楽しめる一曲。' },
  { id: 1702906535, title: 'Flowers', artist: 'Miley Cyrus', tags: [genre.pop, genre.dancepop, genre.disco], region: '海外', reason: 'ディスコ調のベースと覚えやすいサビが心地よく重なります。' },
  { id: 489780142, title: 'Tank!', artist: 'シートベルツ', tags: [genre.jazz], region: '国内', reason: '管楽器の掛け合いが鮮やかな、スピード感のあるビッグバンド曲。' },
  { id: 157427932, title: 'Take Five', artist: 'Dave Brubeck', tags: [genre.jazz], region: '海外', reason: '5拍子のリズムとサックスの旋律がつくる独特の揺れが魅力です。' },
  { id: 657666313, title: 'ポリリズム', artist: 'Perfume', tags: [genre.electro, genre.jpop, genre.dancepop], region: '国内', reason: '電子音と重なり合うリズムに耳を向けたくなる一曲。' },
  { id: 697195462, title: 'One More Time', artist: 'Daft Punk', tags: [genre.house, genre.electro], region: '海外', reason: '反復するハウスのビートと加工された歌声が自然に気分を上げてくれます。' },
  { id: 301002607, title: 'Show Me Love', artist: 'Robin S.', tags: [genre.house], region: '海外', reason: 'オルガンのリフに乗る伸びやかな歌声が際立つハウスの定番です。' },
  { id: 1440856647, title: 'Latch', artist: 'Disclosure & Sam Smith', tags: [genre.house], region: '海外', reason: '細かく刻むビートとサム・スミスの伸びる声が対照的です。' },
  { id: 994425114, title: 'View', artist: 'SHINee', tags: [genre.kpop, genre.house, genre.dancepop], region: '海外', reason: 'ディープハウスの軽い足取りに、5人の歌声が重なります。' },
  { id: 1052057279, title: '4 Walls', artist: 'f(x)', tags: [genre.kpop, genre.house, genre.dancepop], region: '海外', reason: '抑えた歌声と柔らかなシンセが、ハウスのビートに溶け込みます。' },
  { id: 1713266694, title: 'Perfect Night', artist: 'LE SSERAFIM', tags: [genre.kpop, genre.pop], region: '海外', reason: '軽く跳ねるビートと親しみやすいメロディが心地よい一曲。' },
  { id: 1440787349, title: 'Levels', artist: 'Avicii', tags: [genre.edm, genre.house], region: '海外', reason: '明るいシンセのフレーズが繰り返され、曲の高揚感を引っ張ります。' },
  { id: 1440861976, title: 'Clarity (feat. Foxes)', artist: 'Zedd', tags: [genre.edm, genre.electro], region: '海外', reason: '伸びやかなボーカルから一気に広がるドロップが聴きどころです。' },
  { id: 693246567, title: 'Titanium (feat. Sia)', artist: 'David Guetta', tags: [genre.edm, genre.dancepop], region: '海外', reason: 'Siaの力強い声と大きく展開するシンセが響き合います。' },
  { id: 1078923526, title: 'Feather (feat. Cise Starr & Akin Yai)', artist: 'Nujabes', tags: [genre.hiphop], region: '国内', reason: 'ジャジーなピアノループと流れるようなラップが重なります。' },
  { id: 298575248, title: 'No Scrubs', artist: 'TLC', tags: [genre.rnb, genre.pop], region: '海外', reason: '細かく刻むリズムに、滑らかなハーモニーが重なります。' },
  { id: 111153391, title: 'I Bet You Look Good on the Dancefloor', artist: 'Arctic Monkeys', tags: [genre.indie, genre.alternative, genre.rock], region: '海外', reason: '鋭いギターとせわしなく動くドラムが、一気に曲を走らせます。' },
  { id: 1160082180, title: 'Basket Case', artist: 'Green Day', tags: [genre.punk, genre.rock], region: '海外', reason: '短く刻むギターと一緒に歌えるサビが印象的なポップパンク曲。' },
  { id: 1571968519, title: 'Enter Sandman', artist: 'Metallica', tags: [genre.metal, genre.rock], region: '海外', reason: '静かな入りから分厚いギターリフが立ち上がる展開が印象的です。' },
  { id: 1808928566, title: 'The Bells', artist: 'Jeff Mills', tags: [genre.techno], region: '海外', reason: '反復する機械的なビートとベルの音が、途切れない緊張感を生みます。' },
  { id: 1499501875, title: 'Children (Original Version)', artist: 'Robert Miles', tags: [genre.trance], region: '海外', reason: '澄んだピアノの旋律が、規則的に進むビートの上を漂います。' },
  { id: 369711557, title: 'Watercolour', artist: 'Pendulum', tags: [genre.dnb], region: '海外', reason: '速いブレイクビーツに、広がりのある歌とシンセが重なります。' },
  { id: 1706828627, title: '踊り子', artist: 'Vaundy', tags: [genre.funk, genre.jpop], region: '国内', reason: '控えめなビートの中で、ベースの跳ねるグルーヴが光ります。' },
  { id: 1456623340, title: 'September', artist: 'Earth, Wind & Fire', tags: [genre.funk, genre.disco, genre.soul], region: '海外', reason: '歯切れのよいホーンと弾むベースでファンクのグルーヴを楽しめます。' },
  { id: 937107838, title: 'Respect', artist: 'Aretha Franklin', tags: [genre.soul, genre.rnb], region: '海外', reason: '力強い歌声とコーラスの掛け声が鮮やかに応酬します。' },
  { id: 1469584492, title: 'The Thrill Is Gone', artist: 'B.B. King', tags: [genre.blues], region: '海外', reason: '歌の合間に入るギターの一音一音が、余韻を残します。' },
  { id: 1625213809, title: 'Three Little Birds', artist: 'Bob Marley & The Wailers', tags: [genre.reggae], region: '海外', reason: '裏拍を刻むギターとおおらかなコーラスが心地よい一曲。' },
  { id: 1591437487, title: 'プラスティック・ラブ', artist: '竹内まりや', tags: [genre.citypop, genre.jpop, genre.disco], region: '国内', reason: '軽やかなベースと都会的なアレンジに、落ち着いた歌声が重なります。' },
  { id: 324127939, title: 'The Boxer', artist: 'Simon & Garfunkel', tags: [genre.folk], region: '海外', reason: 'アコースティックギターと二人のハーモニーが物語を運びます。' },
  { id: 1422656474, title: 'The Girl from Ipanema', artist: 'Stan Getz & João Gilberto', tags: [genre.bossa, genre.jazz], region: '海外', reason: '穏やかなギターのリズムに、ささやくような歌とサックスが寄り添います。' },
  { id: 1452539461, title: 'ベルガマスク組曲 第3曲「月の光」', artist: 'ジャン＝イヴ・ティボーデ', tags: [genre.classical], region: '海外', reason: 'ピアノの柔らかな音と静かな間合いをじっくり味わえます。' },
  { id: 1514738806, title: 'Bungee', artist: 'BAEKHYUN', tags: [genre.kpop, genre.rnb, mood.lofi], region: '海外', reason: '柔らかな鍵盤と軽く揺れるビートが、くつろいだ雰囲気をつくります。' },
  { id: 1471975982, title: 'UN Village', artist: 'BAEKHYUN', tags: [genre.kpop, genre.rnb, mood.lofi], region: '海外', reason: '控えめなビートと余白のある歌声が、夜に合う落ち着いた雰囲気です。' },
  { id: 1457175657, title: 'MIROH', artist: 'Stray Kids', tags: [genre.kpop, genre.edm], region: '海外', reason: 'ラップからシンセと太いビートが前に出る展開に勢いがあります。' },
  { id: 1569280075, title: 'DUN DUN', artist: 'EVERGLOW', tags: [genre.kpop, genre.edm, genre.dancepop], region: '海外', reason: '鋭いシンセと重い低音が、サビの前後で一気に広がります。' },
  { id: 463402687, title: 'I AM THE BEST', artist: '2NE1', tags: [genre.kpop, genre.edm, genre.electro], region: '海外', reason: '歯切れのよい歌と強い電子ビートが、曲の勢いを作ります。' },
  { id: 814314114, title: 'ギミチョコ!!', artist: 'BABYMETAL', tags: [genre.idol, genre.rock, genre.metal], region: '国内', reason: '重いギターリフと弾む掛け声が交互に飛び出します。' },
  { id: 1147516283, title: 'オーケストラ', artist: 'BiSH', tags: [genre.idol, genre.rock, genre.ballad, genre.jpop], region: '国内', reason: '切ない歌声から、ギターとストリングスが重なるサビへ広がります。' },
  { id: 681020904, title: '恋するフォーチュンクッキー', artist: 'AKB48', tags: [genre.idol, genre.dance, genre.jpop, genre.disco], region: '国内', reason: '軽快なディスコのビートに合わせて踊りたくなる一曲。' },
  { id: 1537565400, title: 'きっかけ', artist: '乃木坂46', tags: [genre.idol, genre.ballad, genre.jpop], region: '国内', reason: '穏やかなピアノと、サビで重なる歌声が印象的なバラードです。' },
  { id: 79565507, title: 'Fast Car', artist: 'トレイシー・チャップマン', tags: [genre.acoustic, genre.folk, genre.ballad], region: '海外', reason: '繰り返すアコースティックギターに、語りかけるような歌声が重なります。' },
];

export function formatDiscoveryGenres(tags) {
  return tags.join(' × ') || 'おまかせ';
}

export function recommendSongs(selectedGenres, region, registeredSongs = []) {
  const requested = [...new Set(selectedGenres)];
  const excludedKeys = new Set(registeredSongs.map(song => songKey(song.title, song.artist)));
  const excludedIds = new Set(registeredSongs.map(song => songTrackId(song.trackId)).filter(Boolean));
  const candidates = [];
  for (const song of catalog) {
    const key = songKey(song.title, song.artist);
    if (excludedKeys.has(key) || excludedIds.has(String(song.id))) continue;
    if (region !== regions[0] && song.region !== region) continue;
    if (!requested.every(tag => song.tags.includes(tag))) continue;
    excludedKeys.add(key);
    candidates.push({ ...song, genre: requested.length ? formatDiscoveryGenres(requested) : song.tags[0] });
  }
  if (requested.length) return candidates.slice(0, 3);

  const firstByGenre = new Map();
  const remaining = [];
  for (const song of candidates) {
    if (firstByGenre.has(song.genre)) remaining.push(song);
    else firstByGenre.set(song.genre, song);
  }
  return [...firstByGenre.values(), ...remaining].slice(0, 3);
}
