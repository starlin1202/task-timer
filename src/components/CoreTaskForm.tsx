/**
 * CoreTaskForm 组件
 * 核心任务创建/编辑表单弹窗
 */

import React, { useState, useEffect } from 'react';
import { CoreTask } from '../types';

interface CoreTaskFormProps {
  task?: CoreTask | null;
  onSave: (task: CoreTask) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const PRIMARY_COLOR = '#F26522';

const CoreTaskForm: React.FC<CoreTaskFormProps> = ({ 
  task, 
  onSave, 
  onCancel, 
  onDelete 
}) => {
  const [name, setName] = useState('');
  const [days, setDays] = useState(1);
  const [dailyHours, setDailyHours] = useState(1);
  const [errors, setErrors] = useState<{ name?: string }>({});

  const isEditing = !!task;
  const totalHours = days * dailyHours;

  useEffect(() => {
    if (task) {
      setName(task.name);
      setDailyHours(task.dailyGoal || 0);
      setDays(Math.round(task.targetHours / (task.dailyGoal || 1)));
    }
  }, [task]);

  const handleSubmit = () => {
    const newErrors: { name?: string } = {};
    if (!name.trim()) {
      newErrors.name = '请输入任务名称';
    }
    if (days <= 0) {
      newErrors.name = '任务天数必须大于0';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const now = Date.now();
    const endAt = now + (Math.max(1, days) * 24 * 60 * 60 * 1000);
    
    const taskData: CoreTask = {
      id: task?.id || generateId(),
      name: name.trim(),
      period: 'custom',
      targetHours: totalHours,
      dailyGoal: dailyHours,
      accumulatedHours: task?.accumulatedHours || 0,
      createdAt: task?.createdAt || now,
      endAt: endAt, // 始终使用新计算的到期日
      status: task?.status || 'active',
      totalDays: Math.max(1, days), // 保存用户设定的任务总天数
    };
    
    onSave(taskData);
  };

  const adjustDays = (delta: number) => {
    setDays(prev => Math.max(1, prev + delta));
  };

  const adjustDailyHours = (delta: number) => {
    setDailyHours(prev => {
      const newValue = prev + delta;
      return Math.max(0.5, Math.min(12, Math.round(newValue * 2) / 2));
    });
  };

  return (
    <div className="bg-white dark:bg-surface-dark w-full max-w-sm rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
      {/* Header */}
      <div className="px-6 pt-7 pb-4 flex justify-center">
        <h2 className="text-xl font-bold text-text-main-light dark:text-text-main-dark">
          {isEditing ? '编辑核心任务' : '设定核心任务'}
        </h2>
      </div>

      {/* Form Content */}
      <div className="px-6 space-y-5 pb-6">
        {/* Task Name */}
        <div>
          <label className="block text-sm font-semibold text-text-sub-light dark:text-text-sub-dark mb-1.5 uppercase tracking-wider">
            任务名称
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors({});
            }}
            placeholder="如：学习 Python"
            className="w-full px-4 py-3.5 rounded-xl border border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/50 text-text-main-light dark:text-text-main-dark focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-base placeholder:text-gray-300"
          />
          {errors.name && (
            <p className="mt-1 text-red-500 text-sm">{errors.name}</p>
          )}
        </div>

        {/* Days and Daily Hours */}
        <div className="grid grid-cols-2 gap-3">
          {/* Days */}
          <div>
            <label className="block text-sm font-semibold text-text-sub-light dark:text-text-sub-dark mb-1.5 uppercase tracking-wider">
              任务天数
            </label>
            <div className="flex items-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-border-light dark:border-border-dark overflow-hidden h-11">
              <button
                onClick={() => adjustDays(-1)}
                className="w-10 h-full flex items-center justify-center text-primary active:bg-primary/10 transition-colors"
              >
                <span className="material-symbols-outlined text-xl font-bold">remove</span>
              </button>
              <div className="flex-1 flex items-center justify-center min-w-0">
                <input
                  type="number"
                  value={days}
                  onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-transparent border-none text-center text-base font-bold text-text-main-light dark:text-text-main-dark focus:ring-0 p-0"
                />
              </div>
              <button
                onClick={() => adjustDays(1)}
                className="w-10 h-full flex items-center justify-center text-primary active:bg-primary/10 transition-colors"
              >
                <span className="material-symbols-outlined text-xl font-bold">add</span>
              </button>
            </div>
          </div>

          {/* Daily Hours */}
          <div>
            <label className="block text-sm font-semibold text-text-sub-light dark:text-text-sub-dark mb-1.5 uppercase tracking-wider">
              每天计划投入时间
            </label>
            <div className="flex items-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-border-light dark:border-border-dark overflow-hidden h-11">
              <button
                onClick={() => adjustDailyHours(-0.5)}
                className="w-10 h-full flex items-center justify-center text-primary active:bg-primary/10 transition-colors"
              >
                <span className="material-symbols-outlined text-xl font-bold">remove</span>
              </button>
              <div className="flex-1 flex items-center justify-center min-w-0">
                <input
                  type="number"
                  step="0.5"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-transparent border-none text-center text-base font-bold text-text-main-light dark:text-text-main-dark focus:ring-0 p-0"
                />
              </div>
              <button
                onClick={() => adjustDailyHours(0.5)}
                className="w-10 h-full flex items-center justify-center text-primary active:bg-primary/10 transition-colors"
              >
                <span className="material-symbols-outlined text-xl font-bold">add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Total Hours Display */}
        <div className="pt-2">
          <p className="text-primary font-bold text-base text-center bg-primary-light/50 dark:bg-primary/10 py-2.5 rounded-xl border border-primary/10">
            总投入时长：<span className="text-lg">{totalHours}</span> 小时
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50/80 dark:bg-gray-800/30 flex items-center justify-between border-t border-border-light/50 dark:border-border-dark/50">
        {isEditing && onDelete && (
          <button
            onClick={onDelete}
            className="text-base font-semibold text-danger hover:text-red-600 transition-colors py-2 px-1"
          >
            删除任务
          </button>
        )}
        <div className="flex items-center gap-3 ml-auto">
          <button
            onClick={onCancel}
            className="text-base font-semibold text-text-sub-light hover:text-text-main-light transition-colors py-2 px-4"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="bg-primary hover:bg-primary-dark text-white text-base font-bold px-8 py-3 rounded-xl shadow-soft transition-all active:scale-95"
            style={{ backgroundColor: PRIMARY_COLOR }}
          >
            {isEditing ? '确认' : '确认开启'}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * 生成唯一ID
 */
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

export default CoreTaskForm;
