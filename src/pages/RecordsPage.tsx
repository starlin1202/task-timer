import React, { useState, useEffect } from 'react';
import { getAllTasksStats, calculatePercentages } from '../utils/stats';
import { getTasks, clearAllRecords, getTimeRecords } from '../utils/storage';
import { formatDuration } from '../utils/timeUtils';
import { Task } from '../types';

// Orange color palette from dark to light
const CHART_COLORS = ['#FF6B00', '#FF9F5A', '#FFCC9D', '#FFE9D6'];

const RecordsPage: React.FC = () => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [stats, setStats] = useState<any[]>([]);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [tasks, setTasksState] = useState<Task[]>([]);

  useEffect(() => {
    const tasks = getTasks();
    setTasksState(tasks);
    loadStats();
  }, [period]);

  const loadStats = () => {
    const records = getTimeRecords();
    const taskStats = getAllTasksStats(period);
    const calculatedStats = calculatePercentages(taskStats);
    
    // Sort by totalTime descending so largest portion gets the darkest color
    const sortedStats = calculatedStats
      .filter(item => item.totalTime > 0)
      .sort((a, b) => b.totalTime - a.totalTime);
    const total = sortedStats.reduce((sum, item) => sum + item.totalTime, 0);
    
    console.log('Records:', records);
    console.log('Task Stats:', taskStats);
    console.log('Calculated Stats:', calculatedStats);
    console.log('Sorted Stats:', sortedStats);
    console.log('Total:', total);
    
    setStats(sortedStats);
    setTotalTime(total);
  };

  const handleClearRecords = () => {
    if (window.confirm('确定要清除所有历史记录吗？此操作不可恢复。')) {
      clearAllRecords();
      loadStats();
    }
  };

  const formatTotalTime = (ms: number) => {
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}小时 ${minutes}分`;
  };

  const calculateDonutValues = () => {
    const circumference = 2 * Math.PI * 42;
    let currentOffset = 0;
    
    return stats.map((item, index) => {
      const percentage = (item.totalTime / totalTime) * 100;
      const strokeLength = (percentage / 100) * circumference;
      const strokeOffset = currentOffset;
      currentOffset += strokeLength;
      
      return {
        ...item,
        strokeLength,
        strokeOffset: circumference - strokeOffset,
        rotation: (strokeOffset / circumference) * 360,
        colorIndex: index,
      };
    });
  };

  const donutData = totalTime > 0 ? calculateDonutValues() : [];

  return (
    <div className="flex flex-col h-full relative">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center justify-center px-5 py-3">
          <h1 className="text-base font-bold tracking-tight">时间统计</h1>
        </div>
      </header>
      
      <div className="flex px-5 py-3">
        <div className="flex h-9 flex-1 items-center justify-center rounded-lg bg-slate-100 p-0.5">
          <label 
            className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-[7px] px-2 text-[13px] font-semibold transition-all ${
              period === 'daily' 
                ? 'bg-white shadow-sm' 
                : 'text-slate-500'
            }`}
            style={{ color: period === 'daily' ? '#FF7A00' : undefined }}
          >
            <span className="truncate">日</span>
            <input 
              checked={period === 'daily'} 
              className="hidden" 
              name="timeframe" 
              type="radio" 
              value="Day"
              onChange={() => setPeriod('daily')}
            />
          </label>
          <label 
            className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-[7px] px-2 text-[13px] font-semibold transition-all ${
              period === 'weekly' 
                ? 'bg-white shadow-sm' 
                : 'text-slate-500'
            }`}
            style={{ color: period === 'weekly' ? '#FF7A00' : undefined }}
          >
            <span className="truncate">周</span>
            <input 
              checked={period === 'weekly'} 
              className="hidden" 
              name="timeframe" 
              type="radio" 
              value="Week"
              onChange={() => setPeriod('weekly')}
            />
          </label>
          <label 
            className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-[7px] px-2 text-[13px] font-semibold transition-all ${
              period === 'monthly' 
                ? 'bg-white shadow-sm' 
                : 'text-slate-500'
            }`}
            style={{ color: period === 'monthly' ? '#FF7A00' : undefined }}
          >
            <span className="truncate">月</span>
            <input 
              checked={period === 'monthly'} 
              className="hidden" 
              name="timeframe" 
              type="radio" 
              value="Month"
              onChange={() => setPeriod('monthly')}
            />
          </label>
        </div>
      </div>
      
      <main className="flex-1 overflow-y-auto px-6 pb-24">
        <div className="flex flex-col items-center justify-center py-10">
          <div className="relative flex items-center justify-center w-60 h-60 donut-container" style={{ filter: 'drop-shadow(0 4px 12px rgba(255, 107, 0, 0.1))' }}>
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle 
                className="text-slate-50" 
                cx="50" 
                cy="50" 
                fill="transparent" 
                r="42" 
                stroke="currentColor" 
                strokeWidth="9"
              />
              {donutData.map((item) => (
                <circle
                  key={item.task.id}
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="42"
                  stroke={CHART_COLORS[item.colorIndex % CHART_COLORS.length]}
                  strokeDasharray={`${item.strokeLength} ${2 * Math.PI * 42}`}
                  strokeDashoffset={item.strokeOffset}
                  strokeLinecap="round"
                  strokeWidth="9"
                  transform={`rotate(${item.rotation} 50 50)`}
                />
              ))}
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">总时长</p>
              <p className="text-slate-900 text-3xl font-bold tracking-tight">
                {totalTime > 0 ? formatTotalTime(totalTime) : '0小时 0分'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-6 pb-12">
          <h3 className="text-slate-900 text-[17px] font-bold tracking-tight">分类统计</h3>
          
          {stats.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>暂无记录</p>
            </div>
          ) : (
            stats.map(({ task, totalTime: time, percentage }, index) => {
              if (!task) return null;
              return (
                <div key={task.id || index} className="flex flex-col gap-2.5">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2">
                      <div 
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      ></div>
                      <span className="text-slate-800 font-semibold text-[15px]">{task?.name || '未知任务'}</span>
                    </div>
                    <span className="text-slate-500 text-xs font-medium">
                      {formatDuration(time)} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${Math.max(percentage, 5)}%`,
                        backgroundColor: CHART_COLORS[index % CHART_COLORS.length]
                      }}
                    ></div>
                  </div>
                </div>
              );
            })
          )}
          
          <div className="pt-8 pb-4 flex justify-center">
            <button 
              onClick={handleClearRecords}
              className="flex items-center gap-2 text-slate-400 text-sm font-medium hover:text-orange-500 transition-colors py-2 px-6 rounded-full border border-slate-100"
            >
              <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
              清除历史记录
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RecordsPage;
