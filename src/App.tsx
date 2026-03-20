/**
 * App 组件
 * 主应用组件，包含路由和底部导航
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import StatsPage from './pages/StatsPage';

const PRIMARY_COLOR = '#F26522';

const App: React.FC = () => {
  return (
    <Router>
      <div className="bg-background-light dark:bg-background-dark text-text-main-light dark:text-text-main-dark font-sans flex flex-col relative overflow-hidden h-[100dvh] max-w-lg mx-auto shadow-2xl">
        <div className="flex-1 overflow-hidden pb-[calc(4rem+env(safe-area-inset-bottom))]">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/stats" element={<StatsPage />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </Router>
  );
};

/**
 * 底部导航栏组件
 * 使用 fixed 定位适配 iOS Safari 底部安全区域
 */
const BottomNav: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isStats = location.pathname === '/stats';

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-surface-light dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 shadow-nav z-50"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {/* 任务 Tab */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center w-full h-full group transition-colors ${
            isHome ? 'text-primary' : 'text-text-sub-light dark:text-text-sub-dark'
          }`}
          style={{ color: isHome ? PRIMARY_COLOR : undefined }}
        >
          <span
            className={`material-icons-round text-2xl transition-all ${
              isHome ? '' : 'group-hover:text-primary'
            }`}
          >
            playlist_add_check
          </span>
          <span className={`text-[10px] mt-1 font-medium ${isHome ? 'font-bold' : ''}`}>
            任务
          </span>
        </Link>

        {/* 统计 Tab */}
        <Link
          to="/stats"
          className={`flex flex-col items-center justify-center w-full h-full group transition-colors ${
            isStats ? 'text-primary' : 'text-text-sub-light dark:text-text-sub-dark'
          }`}
          style={{ color: isStats ? PRIMARY_COLOR : undefined }}
        >
          <span
            className={`material-icons-round text-2xl transition-all ${
              isStats ? '' : 'group-hover:text-primary'
            }`}
          >
            pie_chart
          </span>
          <span className={`text-[10px] mt-1 font-medium ${isStats ? 'font-bold' : ''}`}>
            统计
          </span>
        </Link>
      </div>
    </nav>
  );
};

export default App;
