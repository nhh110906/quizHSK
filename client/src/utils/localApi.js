const SRS_KEY = 'quizhsk_srs';
const STATS_KEY = 'quizhsk_stats';
let cache = null;

async function loadData() {
  if (!cache) {
    const base = import.meta.env.BASE_URL || '/';
    const res = await fetch(`${base}decks.json`);
    cache = await res.json();
  }
  return cache;
}

function getSrs() {
  try { return JSON.parse(localStorage.getItem(SRS_KEY) || '{}'); } catch { return {}; }
}
function saveSrs(srs) { localStorage.setItem(SRS_KEY, JSON.stringify(srs)); }
function getStats() {
  try { return JSON.parse(localStorage.getItem(STATS_KEY) || '{"totalReviews":0,"wordsLearned":0}'); } catch { return { totalReviews: 0, wordsLearned: 0 }; }
}
function saveStats(stats) { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); }

async function getDeck(id) {
  const data = await loadData();
  return data.decks.find((d) => d.id === id) || null;
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

const localApi = {
  getDecks: async () => {
    const data = await loadData();
    return data.decks.map(({ words, ...d }) => d);
  },
  getDeck,
  getScenarios: async () => (await loadData()).scenarios || [],
  getDueCards: async (userId, deckId, limit = 20) => {
    const deck = await getDeck(deckId);
    if (!deck) return [];
    const srs = getSrs()[deckId] || {};
    const now = Date.now();
    const due = [], fresh = [];
    for (const word of deck.words) {
      const card = srs[word.id];
      if (!card) fresh.push(word);
      else if (card.nextReview <= now) due.push({ ...word, srs: card });
    }
    return [...due, ...fresh.map((w) => ({ ...w, srs: null }))].slice(0, limit);
  },
  reviewCard: async ({ deckId, wordId, quality }) => {
    const srs = getSrs();
    if (!srs[deckId]) srs[deckId] = {};
    const q = Math.max(0, Math.min(5, quality));
    let card = srs[deckId][wordId] || { ease: 2.5, interval: 0, repetitions: 0, nextReview: Date.now() };
    if (q < 3) { card.repetitions = 0; card.interval = 0; }
    else {
      if (card.repetitions === 0) card.interval = 1;
      else if (card.repetitions === 1) card.interval = 6;
      else card.interval = Math.round(card.interval * card.ease);
      card.repetitions += 1;
      card.ease = Math.max(1.3, card.ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
    }
    card.nextReview = Date.now() + card.interval * 86400000;
    srs[deckId][wordId] = card;
    saveSrs(srs);
    const stats = getStats();
    stats.totalReviews++;
    if (card.repetitions === 1) stats.wordsLearned++;
    saveStats(stats);
    return card;
  },
  getExercises: async (deckId, type, count = 10) => {
    const deck = await getDeck(deckId);
    if (!deck) return [];
    const words = shuffle(deck.words).slice(0, count);
    if (type === 'dictation') return words.map((w) => ({ id: w.id, type, prompt: w.meaningVi, answer: w.hanzi, pinyin: w.pinyin }));
    if (type === 'fill-blank') return words.map((w) => ({
      id: w.id, type, prompt: `Điền từ có nghĩa "${w.meaningVi}"`, answer: w.hanzi,
      options: shuffle([w.hanzi, ...shuffle(deck.words.filter((x) => x.hanzi !== w.hanzi)).slice(0, 3).map((x) => x.hanzi)]),
    }));
    if (type === 'sentence-order') {
      const templates = [
        { parts: ['我', '是', '学生'], meaning: 'Tôi là học sinh' },
        { parts: ['你', '好', '吗'], meaning: 'Bạn khỏe không?' },
        { parts: ['我', '喜欢', '中国'], meaning: 'Tôi thích Trung Quốc' },
      ];
      return templates.map((t, i) => ({ id: `order-${i}`, type, prompt: `Sắp xếp: "${t.meaning}"`, parts: shuffle([...t.parts]), answer: t.parts }));
    }
    if (type === 'translate') return words.map((w) => ({ id: w.id, type, prompt: `Dịch: "${w.meaningVi}"`, answer: w.hanzi, pinyin: w.pinyin }));
    return [];
  },
  aiFlashcards: async (text, deckId = 'hsk-1') => {
    const deck = (await getDeck(deckId)) || (await getDeck('hsk-1'));
    const found = new Set();
    (text.match(/[\u4e00-\u9fff]+/g) || []).forEach((seg) => {
      deck.words.forEach((w) => { if (seg.includes(w.hanzi)) found.add(w.hanzi); });
    });
    const cards = deck.words.filter((w) => found.has(w.hanzi));
    return { cards: cards.length ? cards : deck.words.slice(0, 5), premium: false };
  },
  aiPath: async (goal) => ({
    goal, duration: '4 tuần', dailyWords: 15,
    steps: [
      { week: 1, focus: 'Flashcard + SRS', minutes: 20 },
      { week: 2, focus: 'Chính tả + Điền từ', minutes: 25 },
      { week: 3, focus: 'Ngữ cảnh + Ngữ pháp', minutes: 30 },
      { week: 4, focus: 'Hội thoại AI', minutes: 30 },
    ],
    message: 'Lộ trình AI - Miễn phí 100%',
  }),
  aiConversation: async (scenarioId, message, history = []) => {
    const replies = {
      travel: { reply: '好的！还要别的吗？', feedback: 'Tốt lắm!' },
      work: { reply: '很高兴认识你！', feedback: 'Giới thiệu tốt!' },
      daily: { reply: '今天天气很好！', feedback: 'Phản hồi tự nhiên!' },
      shopping: { reply: '一共五十块。', feedback: 'Hỏi giá đúng!' },
    };
    const r = replies[scenarioId] || replies.daily;
    return { ...r, history: [...history, { role: 'user', text: message }, { role: 'assistant', text: r.reply }], premium: false };
  },
};

export default localApi;
