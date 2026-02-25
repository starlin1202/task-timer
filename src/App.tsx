import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RecordsPage from './pages/RecordsPage';

const App: React.FC = () => {
  return (
    <Router>
      <div className="bg-background-main text-text-main font-display flex flex-col relative overflow-hidden h-screen max-w-[430px] mx-auto border-x border-slate-100 shadow-2xl">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/records" element={<RecordsPage />} />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  );
};

const BottomNav: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isRecords = location.pathname === '/records';

  return (
    <nav 
      className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 pb-6 pt-3 px-12 z-20"
      style={{ maxWidth: '430px', margin: '0 auto' }}
    >
      <div className="flex justify-around items-center">
        <Link 
          to="/" 
          className="flex flex-col items-center gap-1"
          style={{ color: isHome ? '#FF7A00' : '#94a3b8' }}
        >
          <span 
            className="material-symbols-outlined font-bold text-[24px] leading-none"
            style={{ fontVariationSettings: isHome ? "'FILL' 1, 'wght' 600" : "'FILL' 0, 'wght' 400" }}
          >
            home
          </span>
          <span className={`text-[10px] ${isHome ? 'font-bold' : 'font-medium'}`}>
            首页
          </span>
        </Link>
        <Link 
          to="/records" 
          className="flex flex-col items-center gap-1"
          style={{ color: isRecords ? '#FF7A00' : '#94a3b8' }}
        >
          <span 
            className="material-symbols-outlined text-[24px] leading-none"
            style={{ fontVariationSettings: isRecords ? "'FILL' 1, 'wght' 600" : "'FILL' 0, 'wght' 400" }}
          >
            bar_chart
          </span>
          <span className={`text-[10px] ${isRecords ? 'font-bold' : 'font-medium'}`}>
            统计
          </span>
        </Link>
      </div>
    </nav>
  );
};

export default App;
