import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, '../data/decks.json');
const PROGRESS_PATH = path.join(__dirname, '../data/progress.json');

let cache = null;

export function loadData() {
  if (!cache) {
    cache = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  }
  return cache;
}

function loadProgress() {
  try {
    if (fs.existsSync(PROGRESS_PATH)) {
      return JSON.parse(fs.readFileSync(PROGRESS_PATH, 'utf8'));
    }
  } catch { /* ignore */ }
  return {};
}

function saveProgress(data) {
  fs.mkdirSync(path.dirname(PROGRESS_PATH), { recursive: true });
  fs.writeFileSync(PROGRESS_PATH, JSON.stringify(data, null, 2));
}

export function getDecks() {
  const { decks } = loadData();
  return decks.map(({ words, ...d }) => d);
}

export function getDeck(id) {
  return loadData().decks.find((d) => d.id === id) || null;
}

export function getScenarios() {
  return loadData().scenarios || [];
}

export function getUserProgress(userId) {
  const all = loadProgress();
  return all[userId] || { srs: {}, stats: { streak: 0, totalReviews: 0, wordsLearned: 0 }, customDecks: [] };
}

export function saveUserProgress(userId, progress) {
  const all = loadProgress();
  all[userId] = progress;
  saveProgress(all);
  return progress;
}

// SM-2 spaced repetition
export function getDueCards(userId, deckId, limit = 20) {
  const deck = getDeck(deckId);
  if (!deck) return [];
  const progress = getUserProgress(userId);
  const srs = progress.srs[deckId] || {};
  const now = Date.now();

  const due = [];
  const newCards = [];

  for (const word of deck.words) {
    const card = srs[word.id];
    if (!card) {
      newCards.push(word);
    } else if (card.nextReview <= now) {
      due.push({ ...word, srs: card });
    }
  }

  const result = [...due, ...newCards.map((w) => ({ ...w, srs: null }))].slice(0, limit);
  return result;
}

export function reviewCard(userId, deckId, wordId, quality) {
  const progress = getUserProgress(userId);
  if (!progress.srs[deckId]) progress.srs[deckId] = {};

  const q = Math.max(0, Math.min(5, quality));
  let card = progress.srs[deckId][wordId] || {
    ease: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: Date.now(),
  };

  if (q < 3) {
    card.repetitions = 0;
    card.interval = 0;
  } else {
    if (card.repetitions === 0) card.interval = 1;
    else if (card.repetitions === 1) card.interval = 6;
    else card.interval = Math.round(card.interval * card.ease);
    card.repetitions += 1;
    card.ease = Math.max(1.3, card.ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  }

  card.nextReview = Date.now() + card.interval * 24 * 60 * 60 * 1000;
  progress.srs[deckId][wordId] = card;
  progress.stats.totalReviews = (progress.stats.totalReviews || 0) + 1;
  if (card.repetitions === 1) {
    progress.stats.wordsLearned = (progress.stats.wordsLearned || 0) + 1;
  }

  saveUserProgress(userId, progress);
  return card;
}

export function generateExercises(deckId, type, count = 10) {
  const deck = getDeck(deckId);
  if (!deck) return [];
  const words = [...deck.words].sort(() => Math.random() - 0.5).slice(0, count);

  if (type === 'dictation') {
    return words.map((w) => ({
      id: w.id,
      type: 'dictation',
      prompt: w.meaningVi,
      answer: w.hanzi,
      pinyin: w.pinyin,
      hint: w.pinyin,
    }));
  }

  if (type === 'fill-blank') {
    return words.map((w) => {
      const sentence = `我喜欢___。`;
      return {
        id: w.id,
        type: 'fill-blank',
        prompt: `Điền từ có nghĩa "${w.meaningVi}" vào câu`,
        sentence: sentence.replace('___', '______'),
        answer: w.hanzi,
        options: shuffle([w.hanzi, ...randomWords(deck.words, w.hanzi, 3)]),
        word: w,
      };
    });
  }

  if (type === 'sentence-order') {
    const templates = [
      { parts: ['我', '是', '学生'], meaning: 'Tôi là học sinh' },
      { parts: ['你', '好', '吗'], meaning: 'Bạn khỏe không?' },
      { parts: ['我', '喜欢', '中国'], meaning: 'Tôi thích Trung Quốc' },
      { parts: ['今天', '天气', '很', '好'], meaning: 'Hôm nay thời tiết rất đẹp' },
      { parts: ['我', '想', '喝', '茶'], meaning: 'Tôi muốn uống trà' },
    ];
    return templates.slice(0, count).map((t, i) => ({
      id: `order-${i}`,
      type: 'sentence-order',
      prompt: `Sắp xếp thành câu: "${t.meaning}"`,
      parts: shuffle([...t.parts]),
      answer: t.parts,
      meaning: t.meaning,
    }));
  }

  if (type === 'translate') {
    return words.map((w) => ({
      id: w.id,
      type: 'translate',
      prompt: `Dịch sang tiếng Trung: "${w.meaningVi}"`,
      answer: w.hanzi,
      pinyin: w.pinyin,
      acceptPinyin: true,
    }));
  }

  return [];
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function randomWords(words, exclude, n) {
  return shuffle(words.filter((w) => w.hanzi !== exclude)).slice(0, n).map((w) => w.hanzi);
}

// Mock AI - all premium features free
const AI_FLASHCARD_PATTERNS = [
  { pattern: /水|喝|茶|饮料/, words: ['水', '茶', '喝', '杯子'] },
  { pattern: /吃|饭|菜|餐厅/, words: ['吃', '饭', '菜', '饭店'] },
  { pattern: /学|校|老师|学生/, words: ['学习', '学校', '老师', '学生'] },
  { pattern: /买|钱|商店|块/, words: ['买', '钱', '商店', '块'] },
  { pattern: /天气|热|冷|雨/, words: ['天气', '热', '冷', '下雨'] },
];

export function aiGenerateFlashcards(text, deckId = 'hsk-1') {
  const deck = getDeck(deckId) || getDeck('hsk-1');
  const found = new Set();

  for (const { pattern, words } of AI_FLASHCARD_PATTERNS) {
    if (pattern.test(text)) words.forEach((w) => found.add(w));
  }

  const chineseChars = text.match(/[\u4e00-\u9fff]+/g) || [];
  chineseChars.forEach((seg) => {
    for (const w of deck.words) {
      if (seg.includes(w.hanzi)) found.add(w.hanzi);
    }
  });

  const cards = deck.words.filter((w) => found.has(w.hanzi));
  if (cards.length === 0) {
    return deck.words.slice(0, 5).map((w) => ({ ...w, aiGenerated: true }));
  }
  return cards.map((w) => ({ ...w, aiGenerated: true }));
}

export function aiLearningPath(goal, level = 1) {
  const decks = getDecks().filter((d) => d.level >= level && d.level <= level + 1);
  return {
    goal,
    duration: '4 tuần',
    dailyWords: 15,
    steps: [
      { week: 1, deck: decks[0]?.id, focus: 'Flashcard + Lặp lại ngắt quãng', minutes: 20 },
      { week: 2, deck: decks[0]?.id, focus: 'Luyện chính tả + Điền từ', minutes: 25 },
      { week: 3, deck: decks[1]?.id || decks[0]?.id, focus: 'Ngữ cảnh + Ngữ pháp', minutes: 30 },
      { week: 4, deck: decks[1]?.id || decks[0]?.id, focus: 'Hội thoại AI thực hành', minutes: 30 },
    ],
    premium: false,
    message: 'Lộ trình AI cá nhân hóa - Miễn phí 100%',
  };
}

const CONVERSATION_RESPONSES = {
  travel: [
    { trigger: /要|点|吃/, reply: '好的！还要别的吗？', feedback: 'Tốt! Bạn đã dùng từ đặt món đúng.' },
    { trigger: /水|茶|喝/, reply: '请稍等，马上来。', feedback: 'Xuất sắc! Cách gọi đồ uống tự nhiên.' },
    { default: true, reply: '你想吃什么？可以看看菜单。', feedback: 'Hãy thử dùng: 要, 吃, 喝' },
  ],
  work: [
    { trigger: /名字|叫/, reply: '很高兴认识你！你是做什么工作的？', feedback: 'Giới thiệu bản thân tốt!' },
    { trigger: /工作|学习|学生/, reply: '很棒！你工作多久了？', feedback: 'Trả lời chuyên nghiệp!' },
    { default: true, reply: '请介绍一下你自己。', feedback: 'Hãy thử: 我叫..., 我是学生/工作' },
  ],
  daily: [
    { trigger: /天气|热|冷|雨/, reply: '是啊，今天很适合出门。', feedback: 'Mô tả thời tiết chính xác!' },
    { trigger: /好|不错|很/, reply: '那你想去哪里？', feedback: 'Phản hồi tự nhiên!' },
    { default: true, reply: '今天天气怎么样？', feedback: 'Hãy mô tả thời tiết hôm nay.' },
  ],
  shopping: [
    { trigger: /钱|块|多少/, reply: '一共五十块。', feedback: 'Hỏi giá đúng cách!' },
    { trigger: /买|要|这个/, reply: '好的，给你袋子。', feedback: 'Giao dịch mua bán thành công!' },
    { default: true, reply: '这个很便宜，你要吗？', feedback: 'Hãy hỏi giá hoặc nói muốn mua.' },
  ],
};

export function aiConversation(scenarioId, userMessage, history = []) {
  const responses = CONVERSATION_RESPONSES[scenarioId] || CONVERSATION_RESPONSES.daily;
  const matched = responses.find((r) => r.trigger?.test(userMessage)) || responses.find((r) => r.default);
  return {
    reply: matched.reply,
    feedback: matched.feedback,
    premium: false,
    unlimited: true,
    history: [...history, { role: 'user', text: userMessage }, { role: 'assistant', text: matched.reply }],
  };
}

export function createCustomDeck(userId, name, words) {
  const progress = getUserProgress(userId);
  const deck = {
    id: `custom-${Date.now()}`,
    name,
    wordCount: words.length,
    words: words.map((w, i) => ({
      id: `custom-${Date.now()}-${i}`,
      hanzi: w.hanzi,
      pinyin: w.pinyin || '',
      meaningVi: w.meaningVi || w.meaning || '',
      meaningEn: w.meaningEn || '',
    })),
    custom: true,
  };
  progress.customDecks = progress.customDecks || [];
  progress.customDecks.push(deck);
  saveUserProgress(userId, progress);
  return deck;
}
