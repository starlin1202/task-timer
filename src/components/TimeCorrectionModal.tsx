/**
 * TimeCorrectionModal 组件
 * 修正时间弹窗，用于调整任务在指定时间范围内的总时长
 */

import React, { useState, useEffect } from 'react';
import { TaskType } from '../types';

// 模拟函数：获取任务在指定时间范围内的总时长（分钟）
const getTaskTotalTimeInRange = (taskId: string, period: 'daily' | 'weekly' | 'monthly'): number => {
  // TODO: 实现实际逻辑
  return 0;
};

interface TimeCorrectionModalProps {
  taskId: string;
  taskName: string;
  taskType: TaskType;
  onSave: (period: 'daily' | 'weekly' | 'monthly', totalMinutes: number) => boolean;
  onCancel: () => void;
}

const PRIMARY_COLOR = '#FF6B00';

type PeriodType = 'daily' | 'weekly' | 'monthly';

const TimeCorrectionModal: React.FC<TimeCorrectionModalProps> = ({
  taskId,
  taskName,
  taskType,
  onSave,
  onCancel,
}) => {
  const [period, setPeriod] = useState<PeriodType>('weekly');
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [originalMinutes, setOriginalMinutes] = useState(0);

  // 加载当前时间范围内的已记录时长
  useEffect(() => {
    const recorded = getTaskTotalTimeInRange(taskId, period);
    setOriginalMinutes(recorded);
    const h = Math.floor(recorded / 60);
    const m = recorded % 60;
    setHours(h);
    setMinutes(m);
  }, [taskId, period]);

  const handleSubmit = () => {
    const totalMinutes = hours * 60 + minutes;
    onSave(period, totalMinutes);
  };

  const adjustHours = (delta: number) => {
    setHours(prev => Math.max(0, prev + delta));
  };

  const adjustMinutes = (delta: number) => {
    setMinutes(prev => {
      let newValue = prev + delta;
      if (newValue >= 60) {
        adjustHours(1);
        newValue = 0;
      } else if (newValue < 0) {
        if (hours > 0) {
          adjustHours(-1);
          newValue = 59;
        } else {
          newValue = 0;
        }
      }
      return newValue;
    });
  };

  const getPeriodLabel = () => {
    switch (period) {
      case 'daily':
        return '今日专注时长';
      case 'weekly':
        return '本周专注时长';
      case 'monthly':
        return '本月专注时长';
    }
  };

  const getHintText = () => {
    switch (period) {
      case 'daily':
        return '修正将更新今日记录';
      case 'weekly':
        return '修正将平均分摊至本周每日记录中';
      case 'monthly':
        return '修正将平均分摊至本月每日记录中';
    }
  };

  return (
    <div className="w-full bg-white rounded-[16px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
      <div className="p-5">
        {/* Header */}
        <h2 className="text-lg font-bold text-center text-gray-900 mb-5">
          修正时间
        </h2>

        {/* Period Selector */}
        <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
          {(['daily', 'weekly', 'monthly'] as PeriodType[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-1.5 text-xs font-medium rounded transition-all ${
                period === p
                  ? 'bg-white text-[#FF6B00] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p === 'daily' ? '今日' : p === 'weekly' ? '本周' : '本月'}
            </button>
          ))}
        </div>

        {/* Form Content */}
        <div className="space-y-4">
          {/* Task Name (Read Only) */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">
              任务名称
            </label>
            <div className="w-full bg-gray-50 border border-gray-100 text-gray-400 py-3 px-4 rounded-xl text-sm">
              {taskName}
            </div>
          </div>

          {/* Time Adjustment */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-3 ml-1 text-center">
              {getPeriodLabel()}
            </label>
            <div className="flex items-center justify-between bg-orange-50/50 rounded-2xl p-4 border border-orange-100/50">
              {/* Decrease Button */}
              <button
                onClick={() => adjustHours(-1)}
                className="w-10 h-10 rounded-full bg-[#FF6B00] text-white flex items-center justify-center active:scale-95 transition-transform shadow-sm"
              >
                <span className="material-symbols-outlined text-2xl">remove</span>
              </button>

              {/* Time Display */}
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 leading-none">
                  {hours}
                  <span className="text-sm font-medium text-gray-500 mx-0.5">小时</span>
                  {minutes.toString().padStart(2, '0')}
                  <span className="text-sm font-medium text-gray-500 ml-0.5">分</span>
                </div>
              </div>

              {/* Increase Button */}
              <button
                onClick={() => adjustHours(1)}
                className="w-10 h-10 rounded-full bg-[#FF6B00] text-white flex items-center justify-center active:scale-95 transition-transform shadow-sm"
              >
                <span className="material-symbols-outlined text-2xl">add</span>
              </button>
            </div>

            {/* Hint Text */}
            <p className="mt-2 text-[10px] text-orange-400 text-center flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[12px]">info</span>
              {getHintText()}
            </p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 py-3 text-sm font-medium text-gray-500 rounded-xl hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 text-sm font-bold text-white bg-[#FF6B00] rounded-xl shadow-lg shadow-orange-200 active:scale-[0.98] transition-all"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeCorrectionModal;
