import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const { pathname } = useLocation();

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="logo">
          <span className="logo-icon">中</span>
          QuizHSK
        </Link>
        <nav className="nav">
          <Link to="/decks" className={pathname.startsWith('/decks') || pathname.startsWith('/study') ? 'active' : ''}>
            Học HSK
          </Link>
          <Link to="/ai" className={pathname === '/ai' ? 'active' : ''}>
            AI Miễn Phí
          </Link>
          <Link to="/pricing" className={pathname === '/pricing' ? 'active' : ''}>
            Giá
          </Link>
          <span className="badge-free">FREE 100%</span>
        </nav>
        <Link to="/decks" className="btn btn-primary">
          Bắt Đầu Học
        </Link>
      </div>
    </header>
  );
}
