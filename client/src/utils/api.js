import localApi from './localApi.js';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
let useLocal = import.meta.env.VITE_USE_LOCAL_API === 'true';

async function request(path, options = {}) {
  if (useLocal) throw new Error('local mode');
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function withFallback(remote, local) {
  if (useLocal) return local();
  try { return await remote(); } catch { useLocal = true; return local(); }
}

export const api = {
  getDecks: () => withFallback(() => request('/decks'), () => localApi.getDecks()),
  getDeck: (id) => withFallback(() => request(`/decks/${id}`), () => localApi.getDeck(id)),
  getScenarios: () => withFallback(() => request('/scenarios'), () => localApi.getScenarios()),
  getProgress: (userId) => withFallback(() => request(`/progress/${userId}`), () => Promise.resolve({ srs: {}, stats: {} })),
  getDueCards: (userId, deckId, limit = 20) => withFallback(() => request(`/srs/${userId}/${deckId}?limit=${limit}`), () => localApi.getDueCards(userId, deckId, limit)),
  reviewCard: (data) => withFallback(() => request('/srs/review', { method: 'POST', body: JSON.stringify(data) }), () => localApi.reviewCard(data)),
  getExercises: (deckId, type, count = 10) => withFallback(() => request(`/exercises/${deckId}/${type}?count=${count}`), () => localApi.getExercises(deckId, type, count)),
  aiFlashcards: (text, deckId) => withFallback(() => request('/ai/flashcards', { method: 'POST', body: JSON.stringify({ text, deckId }) }), () => localApi.aiFlashcards(text, deckId)),
  aiPath: (goal, level) => withFallback(() => request('/ai/path', { method: 'POST', body: JSON.stringify({ goal, level }) }), () => localApi.aiPath(goal)),
  aiConversation: (scenarioId, message, history) => withFallback(() => request('/ai/conversation', { method: 'POST', body: JSON.stringify({ scenarioId, message, history }) }), () => localApi.aiConversation(scenarioId, message, history)),
  createCustomDeck: (userId, name, words) => withFallback(() => request('/flashcards/custom', { method: 'POST', body: JSON.stringify({ userId, name, words }) }), () => Promise.resolve({ id: 'local', name, words })),
};

export function getUserId() {
  let id = localStorage.getItem('quizhsk_user');
  if (!id) {
    id = 'user_' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('quizhsk_user', id);
  }
  return id;
}
