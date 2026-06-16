import { Router } from 'express';
import {
  getDecks,
  getDeck,
  getScenarios,
  getUserProgress,
  saveUserProgress,
  getDueCards,
  reviewCard,
  generateExercises,
  aiGenerateFlashcards,
  aiLearningPath,
  aiConversation,
  createCustomDeck,
} from '../services/quizService.js';

const router = Router();

router.get('/health', (_, res) => res.json({ status: 'ok', premium: false, message: 'Tất cả tính năng miễn phí' }));

router.get('/decks', (_, res) => {
  res.json(getDecks());
});

router.get('/decks/:id', (req, res) => {
  const deck = getDeck(req.params.id);
  if (!deck) return res.status(404).json({ error: 'Deck not found' });
  res.json(deck);
});

router.get('/scenarios', (_, res) => {
  res.json(getScenarios());
});

router.get('/progress/:userId', (req, res) => {
  res.json(getUserProgress(req.params.userId));
});

router.post('/progress/:userId', (req, res) => {
  const progress = saveUserProgress(req.params.userId, { ...getUserProgress(req.params.userId), ...req.body });
  res.json(progress);
});

router.get('/srs/:userId/:deckId', (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  res.json(getDueCards(req.params.userId, req.params.deckId, limit));
});

router.post('/srs/review', (req, res) => {
  const { userId, deckId, wordId, quality } = req.body;
  if (!userId || !deckId || !wordId || quality === undefined) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  res.json(reviewCard(userId, deckId, wordId, quality));
});

router.get('/exercises/:deckId/:type', (req, res) => {
  const count = parseInt(req.query.count) || 10;
  res.json(generateExercises(req.params.deckId, req.params.type, count));
});

// Premium features - ALL FREE
router.post('/ai/flashcards', (req, res) => {
  const { text, deckId } = req.body;
  const cards = aiGenerateFlashcards(text || '', deckId);
  res.json({ cards, premium: false, message: 'AI Flashcard - Miễn phí không giới hạn' });
});

router.post('/ai/path', (req, res) => {
  const { goal, level } = req.body;
  res.json(aiLearningPath(goal || 'Luyện thi HSK', level || 1));
});

router.post('/ai/conversation', (req, res) => {
  const { scenarioId, message, history } = req.body;
  res.json(aiConversation(scenarioId || 'daily', message || '', history || []));
});

router.post('/flashcards/custom', (req, res) => {
  const { userId, name, words } = req.body;
  if (!userId || !name || !words?.length) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  res.json(createCustomDeck(userId, name, words));
});

export default router;
