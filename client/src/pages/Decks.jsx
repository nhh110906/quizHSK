import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';

export default function Decks() {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDecks().then(setDecks).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Đang tải bộ học...</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>Chọn Bộ Học HSK</h1>
        <p>Lộ trình từ vựng HSK 1-6 — học miễn phí không giới hạn</p>
      </div>
      <div className="decks-grid">
        {decks.map((deck) => (
          <Link key={deck.id} to={`/study/${deck.id}`} className="deck-card">
            <span className="deck-level">{deck.name}</span>
            <h3>{deck.nameVi}</h3>
            <p>{deck.description}</p>
            <div className="deck-count">{deck.wordCount} từ vựng</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
