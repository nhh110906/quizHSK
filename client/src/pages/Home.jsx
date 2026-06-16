import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="badge-free" style={{ marginBottom: '1rem', display: 'inline-block' }}>
            MIỄN PHÍ 100% — KHÔNG PAYWALL
          </span>
          <h1>Web Học Từ Vựng HSK Miễn Phí Cho Người Việt</h1>
          <p>
            QuizHSK — học tiếng Trung qua flashcard, lặp lại ngắt quãng, luyện chính tả,
            ngữ pháp và hội thoại AI. Tất cả tính năng Premium đều miễn phí.
          </p>
          <div className="hero-actions">
            <Link to="/decks" className="btn btn-primary btn-lg">Bắt Đầu Học Miễn Phí</Link>
            <Link to="/ai" className="btn btn-outline btn-lg">Dùng AI Miễn Phí</Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><strong>9,700+</strong><span>Từ vựng HSK</span></div>
            <div className="hero-stat"><strong>6</strong><span>Cấp độ HSK</span></div>
            <div className="hero-stat"><strong>∞</strong><span>AI không giới hạn</span></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Tính Năng Đầy Đủ — Tất Cả Miễn Phí</h2>
          <p className="section-sub">Những tính năng Premium trên OpenQuiz đều được mở khóa hoàn toàn</p>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🃏</div>
              <h3>Flashcard & SRS</h3>
              <p>Lặp lại ngắt quãng khoa học, học từ vựng HSK 1-6 không giới hạn.</p>
              <span className="badge-free">MIỄN PHÍ</span>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✍️</div>
              <h3>Luyện Chính Tả</h3>
              <p>Nghe nghĩa tiếng Việt, gõ chữ Hán — rèn kỹ năng viết.</p>
              <span className="badge-free">MIỄN PHÍ</span>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI Tạo Flashcard</h3>
              <p>Nhập văn bản tiếng Trung — AI trích xuất từ vựng tự động. (Premium trên OpenQuiz)</p>
              <span className="badge-free">MIỄN PHÍ ∞</span>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Hội Thoại AI</h3>
              <p>Luyện nói trong tình huống thực tế: du lịch, công việc, mua sắm. (Premium trên OpenQuiz)</p>
              <span className="badge-free">MIỄN PHÍ ∞</span>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>AI Lộ Trình Học</h3>
              <p>Lộ trình cá nhân hóa theo mục tiêu HSK của bạn. (Premium trên OpenQuiz)</p>
              <span className="badge-free">MIỄN PHÍ ∞</span>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3>Ngữ Pháp & Ngữ Cảnh</h3>
              <p>Điền từ, sắp xếp câu, dịch thuật trong ngữ cảnh thực tế.</p>
              <span className="badge-free">MIỄN PHÍ</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--surface)' }}>
        <div className="container">
          <h2 className="section-title">Lộ Trình HSK Sẵn Có</h2>
          <p className="section-sub">Từ HSK I đến HSK VI — đầy đủ từ vựng chuẩn</p>
          <div className="decks-grid">
            {[
              { level: 'HSK I', words: '~150 từ', desc: 'Sơ cấp' },
              { level: 'HSK II', words: '~300 từ', desc: 'Sơ trung cấp' },
              { level: 'HSK III', words: '~600 từ', desc: 'Trung cấp' },
              { level: 'HSK IV', words: '~1.200 từ', desc: 'Trung cao cấp' },
              { level: 'HSK V', words: '~2.500 từ', desc: 'Cao cấp' },
              { level: 'HSK VI', words: '~5.000 từ', desc: 'Thành thạo' },
            ].map((d) => (
              <Link key={d.level} to="/decks" className="deck-card">
                <span className="deck-level">{d.level}</span>
                <h3>{d.desc}</h3>
                <p>{d.words}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
