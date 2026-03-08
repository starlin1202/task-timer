/**
 * StatsPage 组件
 * 统计页面 - 展示任务时间统计
 */

import React, { useState, useEffect } from 'react';
import { TaskStatItem, StatsPeriod, TaskType } from '../types';
import { getAllTasksStats, CHART_COLORS, getTotalTime } from '../utils/stats';
import { clearAllStats, correctTimeRecord } from '../utils/storage';
import { formatDuration, formatDateToString } from '../utils/timeUtils';
import TimeCorrectionModal from '../components/TimeCorrectionModal';

const PRIMARY_COLOR = '#FF6B00';

// 橙色渐变色系（从深到浅）
const ORANGE_COLORS = [
  '#FF6B00', // 主橙色
  '#FB923C', // orange-400
  '#FDBA74', // orange-300
  '#FED7AA', // orange-200
  '#FFE4C4', // 更浅的橙色
];

const StatsPage: React.FC = () => {
  const [period, setPeriod] = useState<StatsPeriod>('weekly');
  const [stats, setStats] = useState<TaskStatItem[]>([]);
  const [totalTime, setTotalTime] = useState(0);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [correctionTask, setCorrectionTask] = useState<TaskStatItem | null>(null);

  // 加载统计数据
  const loadStats = () => {
    const taskStats = getAllTasksStats(period);
    // 过滤掉时间为0的任务，并按时间降序排序
    const filteredStats = taskStats
      .filter(item => item.totalTime > 0)
      .sort((a, b) => b.totalTime - a.totalTime);
    
    setStats(filteredStats);
    setTotalTime(getTotalTime(period));
  };

  useEffect(() => {
    loadStats();
  }, [period]);

  // 处理清除统计
  const handleClearStats = () => {
    clearAllStats();
    loadStats();
    setShowClearConfirm(false);
  };

  // 处理修正时间
  const handleCorrectTime = (period: 'daily' | 'weekly' | 'monthly', totalMinutes: number): boolean => {
    if (!correctionTask) return false;
    
    // 获取当前时间范围内的已有时间（转换为分钟）
    const currentMs = correctionTask.totalTime;
    const currentMinutes = Math.floor(currentMs / (60 * 1000));
    
    // 计算需要调整的差值
    const diffMinutes = totalMinutes - currentMinutes;
    
    if (diffMinutes === 0) {
      setCorrectionTask(null);
      return true;
    }
    
    // 根据 period 获取对应的日期范围
    const today = new Date();
    const dates: string[] = [];
    
    if (period === 'daily') {
      // 今日：只修正今天
      dates.push(formatDateToString(today));
    } else if (period === 'weekly') {
      // 本周：获取本周所有日期
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // 调整为周一开始
      const monday = new Date(today.setDate(diff));
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        if (date <= new Date()) {
          dates.push(formatDateToString(date));
        }
      }
    } else if (period === 'monthly') {
      // 本月：获取本月所有日期
      const year = today.getFullYear();
      const month = today.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        if (date <= new Date()) {
          dates.push(formatDateToString(date));
        }
      }
    }
    
    if (dates.length === 0) {
      return false;
    }
    
    // 将差值平均分摊到每一天
    const minutesPerDay = Math.floor(diffMinutes / dates.length);
    const remainder = diffMinutes % dates.length;
    
    // 应用修正
    let success = true;
    dates.forEach((date, index) => {
      const adjustment = minutesPerDay + (index < remainder ? (diffMinutes > 0 ? 1 : -1) : 0);
      if (adjustment !== 0) {
        const result = correctTimeRecord(
          correctionTask.taskId,
          correctionTask.taskType,
          date,
          adjustment
        );
        if (!result) {
          success = false;
        }
      }
    });
    
    if (success) {
      loadStats();
      setCorrectionTask(null);
    }
    
    return success;
  };

  // 格式化总时长为小数形式（如 42.5 小时）
  const formatTotalHours = (ms: number): string => {
    const hours = ms / (60 * 60 * 1000);
    return hours.toFixed(1);
  };

  // 格式化时长为小时分钟形式
  const formatHoursAndMinutes = (ms: number): string => {
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}小时${minutes.toString().padStart(2, '0')}分`;
  };

  // 计算圆环图的 conic-gradient
  const calculateDonutGradient = () => {
    if (stats.length === 0 || totalTime === 0) {
      return 'conic-gradient(#E5E7EB 0% 100%)';
    }

    let gradient = '';
    let currentPercent = 0;

    stats.forEach((item, index) => {
      const percentage = (item.totalTime / totalTime) * 100;
      const color = ORANGE_COLORS[index % ORANGE_COLORS.length];
      gradient += `${color} ${currentPercent}% ${currentPercent + percentage}%, `;
      currentPercent += percentage;
    });

    // 移除末尾的逗号和空格
    return `conic-gradient(${gradient.slice(0, -2)})`;
  };

  return (
    <div className="flex flex-col h-full relative bg-white">
      {/* Header */}
      <header className="px-5 py-4 flex justify-center items-center bg-white z-10 relative">
        <h1 className="text-lg font-bold tracking-tight text-gray-900">
          时间统计
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto hide-scrollbar pb-32">
        {/* Period Selector */}
        <div className="px-5 mt-2 mb-8">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {(['daily', 'weekly', 'monthly'] as StatsPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  period === p
                    ? 'bg-white text-[#FF6B00] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p === 'daily' ? '日' : p === 'weekly' ? '周' : '月'}
              </button>
            ))}
          </div>
        </div>

        {/* Donut Chart */}
        <div className="px-5 mb-10">
          <div className="flex flex-col items-center justify-center py-4 relative">
            <div 
              className="relative w-[220px] h-[220px] rounded-full"
              style={{
                background: calculateDonutGradient(),
              }}
            >
              {/* Donut Hole */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[170px] h-[170px] bg-white rounded-full flex flex-col items-center justify-center">
                <span className="text-xs text-gray-400 font-medium mb-1">总时长</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900 leading-none">
                    {formatTotalHours(totalTime)}
                  </span>
                  <span className="text-sm font-bold text-gray-900">小时</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Task Distribution */}
        <div className="px-5 mb-4">
          <h3 className="text-lg font-bold text-gray-900">任务分布</h3>
        </div>

        <div className="px-5 space-y-8">
          {stats.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <span className="material-symbols-outlined text-4xl mb-2 text-gray-300">
                pie_chart
              </span>
              <p>暂无记录</p>
              <p className="text-sm mt-1">开始计时后将在此显示统计</p>
            </div>
          ) : (
            stats.map((item, index) => {
              const color = ORANGE_COLORS[index % ORANGE_COLORS.length];
              return (
                <div key={item.taskId} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-base font-medium text-gray-900">
                        {item.taskName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">
                        {formatHoursAndMinutes(item.totalTime)} ({item.percentage.toFixed(0)}%)
                      </span>
                      <button 
                        onClick={() => setCorrectionTask(item)}
                        className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-[#FF6B00] border border-orange-100 rounded-md bg-orange-50/30 hover:bg-orange-50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-xs">edit</span>
                        <span>修正时间</span>
                      </button>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${Math.max(item.percentage, 3)}%`,
                        backgroundColor: color 
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Clear History Button */}
        {stats.length > 0 && (
          <div className="mt-7 mb-[52px] flex justify-center">
            <button 
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">delete</span>
              <span className="text-sm">清除历史记录</span>
            </button>
          </div>
        )}
      </main>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-[2px]">
          <div className="bg-white w-full max-w-sm rounded-[24px] shadow-2xl overflow-hidden p-6">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-red-500 text-2xl">warning</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                清除所有统计数据
              </h3>
              <p className="text-sm text-gray-500">
                确定要清除所有统计数据吗？此操作不可恢复，所有任务的累积时长将被清零。
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleClearStats}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors"
              >
                确定清除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time Correction Modal */}
      {correctionTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-[2px]">
          <TimeCorrectionModal
            taskId={correctionTask.taskId}
            taskName={correctionTask.taskName}
            taskType={correctionTask.taskType}
            onSave={handleCorrectTime}
            onCancel={() => setCorrectionTask(null)}
          />
        </div>
      )}
    </div>
  );
};

export default StatsPage;
