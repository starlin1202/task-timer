/**
 * GlobalTimerBar 组件
 * 全局计时条，显示在页面顶部
 */

import React, { useEffect, useState } from 'react';
import { TimerSession } from '../types';
import { formatTime } from '../utils/timeUtils';

interface GlobalTimerBarProps {
  session: TimerSession | null;
  taskName: string;
  onPauseResume: () => void;
  onStop: () => void;
}

const PRIMARY_COLOR = '#F26522';
const PRIMARY_LIGHT = '#FFF3E0';

const GlobalTimerBar: React.FC<GlobalTimerBarProps> = ({
  session,
  taskName,
  onPauseResume,
  onStop,
}) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (session?.isRunning && !session.isPaused) {
      interval = setInterval(() => {
        const now = Date.now();
        const currentElapsed = now - session.startTime + session.elapsedBeforePause;
        setElapsed(currentElapsed);
      }, 1000);
    } else if (session) {
      setElapsed(session.elapsedBeforePause);
    } else {
      setElapsed(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [session]);

  if (!session) return null;

  const isPaused = session.isPaused;

  return (
    <div 
      className="px-4 mt-2 mb-6"
      style={{ animation: 'slideDown 0.3s ease-out' }}
    >
      <div 
        className="rounded-2xl p-3 flex items-center justify-between shadow-sm space-x-2 border"
        style={{ 
          backgroundColor: PRIMARY_LIGHT,
          borderColor: 'rgba(242, 101, 34, 0.1)'
        }}
      >
        {/* Left: Status and Task Name */}
        <div className="flex items-center space-x-2 flex-shrink min-w-0">
          <div 
            className="w-2.5 h-2.5 rounded-full flex-shrink-0 ml-1"
            style={{ 
              backgroundColor: PRIMARY_COLOR,
              animation: isPaused ? 'none' : 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}
          />
          <h2 className="text-gray-800 dark:text-white font-bold text-sm truncate whitespace-nowrap">
            {taskName}
          </h2>
        </div>

        {/* Right: Timer and Controls */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <div 
            className="font-mono text-lg font-bold tracking-tight"
            style={{ color: PRIMARY_COLOR }}
          >
            {formatTime(elapsed)}
          </div>
          <div className="flex items-center space-x-1">
            {/* Pause/Resume Button */}
            <button
              onClick={onPauseResume}
              className="w-7 h-7 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform"
              aria-label={isPaused ? '继续' : '暂停'}
            >
              <span 
                className="material-icons-round text-lg"
                style={{ color: PRIMARY_COLOR }}
              >
                {isPaused ? 'play_arrow' : 'pause'}
              </span>
            </button>
            {/* Stop Button */}
            <button
              onClick={onStop}
              className="w-7 h-7 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform"
              aria-label="停止"
            >
              <span className="material-icons-round text-gray-400 text-base">
                stop
              </span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.9);
          }
        }
      `}</style>
    </div>
  );
};

export default GlobalTimerBar;
