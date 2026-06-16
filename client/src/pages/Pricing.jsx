import { Link } from 'react-router-dom';

export default function Pricing() {
  return (
    <div className="container">
      <div className="page-header">
        <h1>Giá Cả Đơn Giản — Tất Cả Miễn Phí</h1>
        <p>Trên OpenQuiz, các tính năng dưới đây yêu cầu Premium 159.000đ/tháng. Tại QuizHSK, tất cả đều miễn phí.</p>
      </div>

      <div className="pricing-grid">
        <div className="pricing-card featured">
          <h3>Miễn Phí Mãi Mãi</h3>
          <div className="pricing-price">0đ</div>
          <ul className="pricing-features">
            <li>Học lặp lại ngắt quãng không giới hạn</li>
            <li>Luyện chính tả không giới hạn</li>
            <li>Tạo flashcard thủ công</li>
            <li>Chế độ học cơ bản</li>
            <li>HSK 1-6 đầy đủ</li>
          </ul>
          <Link to="/decks" className="btn btn-primary" style={{ width: '100%' }}>Bắt Đầu Học</Link>
        </div>

        <div className="pricing-card featured">
          <h3>AI Premium (Mở Khóa)</h3>
          <div className="pricing-price" style={{ color: 'var(--success)' }}>0đ</div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>OpenQuiz: 159.000đ/tháng</p>
          <ul className="pricing-features">
            <li>Tạo flashcard AI không giới hạn</li>
            <li>Lộ trình học AI không giới hạn</li>
            <li>Luyện hội thoại AI không giới hạn</li>
            <li>Ảnh/văn bản → flashcard AI</li>
            <li>Tính năng AI nâng cao</li>
          </ul>
          <Link to="/ai" className="btn btn-primary" style={{ width: '100%' }}>Dùng AI Miễn Phí</Link>
        </div>
      </div>
    </div>
  );
}
