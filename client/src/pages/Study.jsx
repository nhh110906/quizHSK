import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, getUserId } from '../utils/api';

const MODES = [
  { id: 'flashcard', label: '🃏 Flashcard', desc: 'SRS' },
  { id: 'dictation', label: '✍️ Chính tả', desc: 'Gõ Hán tự' },
  { id: 'fill-blank', label: '📝 Điền từ', desc: 'Ngữ cảnh' },
  { id: 'sentence-order', label: '🔤 Sắp câu', desc: 'Ngữ pháp' },
  { id: 'translate', label: '🌐 Dịch', desc: 'Vi → Trung' },
];

export default function Study() {
  const { deckId } = useParams();
  const [deck, setDeck] = useState(null);
  const [mode, setMode] = useState('flashcard');
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const userId = getUserId();

  const loadMode = useCallback(async () => {
    setLoading(true);
    setIndex(0);
    setFlipped(false);
    setAnswer('');
    setFeedback(null);
    setScore({ correct: 0, total: 0 });

    if (mode === 'flashcard') {
      const due = await api.getDueCards(userId, deckId, 20);
      setCards(due);
    } else {
      const ex = await api.getExercises(deckId, mode, 10);
      setCards(ex);
    }
    setLoading(false);
  }, [mode, deckId, userId]);

  useEffect(() => {
    api.getDeck(deckId).then(setDeck);
  }, [deckId]);

  useEffect(() => {
    if (deck) loadMode();
  }, [deck, loadMode]);

  const current = cards[index];

  const handleRating = async (quality) => {
    if (current?.id) {
      await api.reviewCard({ userId, deckId, wordId: current.id, quality });
    }
    if (index < cards.length - 1) {
      setIndex((i) => i + 1);
      setFlipped(false);
    } else {
      setFeedback('Hoàn thành phiên học! 🎉');
    }
  };

  const checkAnswer = (userAns) => {
    const correct = current.answer?.trim();
    const isCorrect = userAns.trim() === correct || userAns.trim().toLowerCase() === current.pinyin?.toLowerCase();
    setScore((s) => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
    setFeedback(isCorrect ? '✓ Chính xác!' : `✗ Đáp án: ${correct} (${current.pinyin || ''})`);
    setTimeout(() => {
      setFeedback(null);
      setAnswer('');
      if (index < cards.length - 1) setIndex((i) => i + 1);
      else setFeedback('Hoàn thành! Điểm: ' + (score.correct + (isCorrect ? 1 : 0)) + '/' + (score.total + 1));
    }, 1500);
  };

  if (!deck) return <div className="loading">Đang tải...</div>;

  return (
    <div className="container">
      <div className="page-header">
        <Link to="/decks" style={{ fontSize: '0.85rem' }}>← Quay lại</Link>
        <h1>{deck.nameVi}</h1>
        <p>{deck.wordCount} từ · Chế độ học miễn phí</p>
      </div>

      <div className="modes-grid">
        {MODES.map((m) => (
          <button key={m.id} className={`mode-btn ${mode === m.id ? 'active' : ''}`} onClick={() => setMode(m.id)}>
            {m.label}<br /><small>{m.desc}</small>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Đang chuẩn bị bài học...</div>
      ) : cards.length === 0 ? (
        <div className="loading">Không có thẻ nào. Thử chế độ khác!</div>
      ) : mode === 'flashcard' && current ? (
        <>
          <div className="score-display">{index + 1} / {cards.length}</div>
          <div className="flashcard-container">
            <div className="flashcard" onClick={() => setFlipped(!flipped)}>
              {!flipped ? (
                <>
                  <div className="hanzi chinese">{current.hanzi}</div>
                  <div className="pinyin">{current.pinyin}</div>
                  <div className="flashcard-hint">Nhấn để xem nghĩa</div>
                </>
              ) : (
                <>
                  <div className="meaning">{current.meaningVi}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{current.meaningEn}</div>
                </>
              )}
            </div>
          </div>
          {flipped && (
            <div className="rating-btns">
              <button className="rating-btn btn-danger" onClick={() => handleRating(1)}>Khó</button>
              <button className="rating-btn" style={{ background: '#fef3c7' }} onClick={() => handleRating(3)}>Nhớ</button>
              <button className="rating-btn btn-success" onClick={() => handleRating(5)}>Dễ</button>
            </div>
          )}
        </>
      ) : current ? (
        <div className="exercise-box">
          <div className="score-display">{index + 1} / {cards.length}</div>
          <p>{current.prompt}</p>

          {mode === 'fill-blank' && current.options && (
            <div className="options-grid">
              {current.options.map((opt) => (
                <button key={opt} className="option-btn chinese" onClick={() => checkAnswer(opt)}>{opt}</button>
              ))}
            </div>
          )}

          {mode === 'sentence-order' && current.parts && (
            <div className="options-grid">
              {current.parts.map((part, i) => (
                <button key={i} className="option-btn chinese" onClick={() => {
                  const selected = answer ? answer.split(' ') : [];
                  const next = [...selected, part].join(' ');
                  setAnswer(next);
                  if (selected.length + 1 === current.answer.length) {
                    checkAnswer(next.replace(/ /g, ''));
                  }
                }}>{part}</button>
              ))}
            </div>
          )}

          {(mode === 'dictation' || mode === 'translate') && (
            <>
              <input
                className="exercise-input chinese"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Nhập chữ Hán..."
                onKeyDown={(e) => e.key === 'Enter' && checkAnswer(answer)}
              />
              <button className="btn btn-primary" onClick={() => checkAnswer(answer)}>Kiểm tra</button>
            </>
          )}

          {feedback && <p style={{ textAlign: 'center', marginTop: '1rem', fontWeight: 600 }}>{feedback}</p>}
        </div>
      ) : null}

      {feedback && mode === 'flashcard' && (
        <p style={{ textAlign: 'center', fontWeight: 600, color: 'var(--success)' }}>{feedback}</p>
      )}
    </div>
  );
}
