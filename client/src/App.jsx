import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Decks from './pages/Decks';
import Study from './pages/Study';
import AI from './pages/AI';
import Pricing from './pages/Pricing';

export default function App() {
  return (
    <>
      <Header />
      <main style={{ minHeight: '70vh' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/decks" element={<Decks />} />
          <Route path="/study/:deckId" element={<Study />} />
          <Route path="/ai" element={<AI />} />
          <Route path="/pricing" element={<Pricing />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
