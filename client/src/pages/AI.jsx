import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function AI() {
  const [tab, setTab] = useState('flashcard');
  const [text, setText] = useState('我想去饭店吃饭，喝一杯茶。');
  const [aiCards, setAiCards] = useState([]);
  const [goal, setGoal] = useState('Luyện thi HSK 3 trong 4 tuần');
  const [path, setPath] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [scenario, setScenario] = useState('travel');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getScenarios().then((s) => {
      setScenarios(s);
      if (s.length) setScenario(s[0].id);
    });
  }, []);

  const generateFlashcards = async () => {
    setLoading(true);
    const res = await api.aiFlashcards(text, 'hsk-1');
    setAiCards(res.cards);
    setLoading(false);
  };

  const generatePath = async () => {
    setLoading(true);
    const res = await api.aiPath(goal, 1);
    setPath(res);
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const res = await api.aiConversation(scenario, input, messages);
    setMessages(res.history);
    if (res.feedback) {
      setTimeout(() => {
        setMessages((m) => [...m, { role: 'feedback', text: res.feedback }]);
      }, 300);
    }
    setInput('');
    setLoading(false);
  };

  const tabs = [
    { id: 'flashcard', label: '🤖 AI Flashcard' },
    { id: 'path', label: '📋 AI Lộ trình' },
    { id: 'chat', label: '💬 Hội thoại AI' },
  ];

  return (
    <div className="container">
      <div className="page-header">
        <span className="badge-free">PREMIUM → MIỄN PHÍ 100%</span>
        <h1>AI Miễn Phí Không Giới Hạn</h1>
        <p>Các tính năng AI Premium trên OpenQuiz — hoàn toàn miễn phí tại đây</p>
      </div>

      <div className="modes-grid" style={{ maxWidth: 500, margin: '0 auto 2rem' }}>
        {tabs.map((t) => (
          <button key={t.id} className={`mode-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'flashcard' && (
        <div className="ai-panel">
          <h3>AI Tạo Flashcard Từ Văn Bản</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Nhập văn bản tiếng Trung hoặc mô tả — AI trích xuất từ vựng (miễn phí không giới hạn)
          </p>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Nhập văn bản tiếng Trung..." />
          <button className="btn btn-primary" onClick={generateFlashcards} disabled={loading}>
            {loading ? 'Đang tạo...' : 'Tạo Flashcard AI'}
          </button>
          {aiCards.length > 0 && (
            <div className="ai-results">
              {aiCards.map((c) => (
                <div key={c.id} className="ai-card">
                  <div className="hanzi chinese">{c.hanzi}</div>
                  <div style={{ fontSize: '0.8rem' }}>{c.pinyin}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.meaningVi}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'path' && (
        <div className="ai-panel">
          <h3>AI Lộ Trình Học Cá Nhân</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Mô tả mục tiêu — AI tạo lộ trình 4 tuần (Premium trên OpenQuiz → miễn phí)
          </p>
          <input
            className="exercise-input"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            style={{ fontFamily: 'var(--font)' }}
          />
          <button className="btn btn-primary" onClick={generatePath} disabled={loading}>
            {loading ? 'Đang tạo...' : 'Tạo Lộ Trình AI'}
          </button>
          {path && (
            <div style={{ marginTop: '1.5rem' }}>
              <p><strong>Mục tiêu:</strong> {path.goal}</p>
              <p><strong>Thời gian:</strong> {path.duration} · <strong>{path.dailyWords} từ/ngày</strong></p>
              {path.steps.map((s) => (
                <div key={s.week} style={{ padding: '0.75rem', background: 'var(--primary-light)', borderRadius: 8, margin: '0.5rem 0' }}>
                  <strong>Tuần {s.week}:</strong> {s.focus} ({s.minutes} phút/ngày)
                </div>
              ))}
              <p style={{ color: 'var(--success)', fontWeight: 600, marginTop: '1rem' }}>{path.message}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'chat' && (
        <div>
          <div className="modes-grid" style={{ maxWidth: 500, margin: '0 auto 1rem' }}>
            {scenarios.map((s) => (
              <button
                key={s.id}
                className={`mode-btn ${scenario === s.id ? 'active' : ''}`}
                onClick={() => { setScenario(s.id); setMessages([]); }}
              >
                {s.title}
              </button>
            ))}
          </div>
          <div className="chat-container">
            <div className="chat-messages">
              {messages.length === 0 && (
                <div className="chat-bubble assistant chinese">
                  {scenarios.find((s) => s.id === scenario)?.prompts?.[0]?.text || '你好！'}
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`chat-bubble ${m.role} ${m.role === 'user' || m.role === 'assistant' ? 'chinese' : ''}`}>
                  {m.text}
                </div>
              ))}
            </div>
            <div className="chat-input-row">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập câu trả lời tiếng Trung..."
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button className="btn btn-primary" onClick={sendMessage} disabled={loading}>Gửi</button>
            </div>
          </div>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.75rem' }}>
            Hội thoại AI không giới hạn — miễn phí 100%
          </p>
        </div>
      )}
    </div>
  );
}
