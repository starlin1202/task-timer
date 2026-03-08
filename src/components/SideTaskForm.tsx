/**
 * SideTaskForm 组件
 * 非核心任务添加弹窗
 */

import React, { useState } from 'react';
import { SIDE_TASK_ICONS } from '../types';

interface SideTaskFormProps {
  onSave: (name: string, icon: string) => void;
  onCancel: () => void;
}

const PRIMARY_COLOR = '#F26522';

const SideTaskForm: React.FC<SideTaskFormProps> = ({ onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('menu_book');
  const [errors, setErrors] = useState<{ name?: string }>({});

  const handleSubmit = () => {
    const newErrors: { name?: string } = {};
    if (!name.trim()) {
      newErrors.name = '请输入任务名称';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSave(name.trim(), selectedIcon);
  };

  return (
    <div className="bg-white dark:bg-surface-dark w-full max-w-sm rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
      {/* Header */}
      <div className="px-6 pt-7 pb-4 flex justify-center">
        <h2 className="text-xl font-bold text-text-main-light dark:text-text-main-dark">
          添加其他任务
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
            placeholder="如：阅读"
            className="w-full px-4 py-3.5 rounded-xl border border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/50 text-text-main-light dark:text-text-main-dark focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-base placeholder:text-gray-300"
          />
          {errors.name && (
            <p className="mt-1 text-red-500 text-sm">{errors.name}</p>
          )}
        </div>

        {/* Icon Selection */}
        <div>
          <label className="block text-sm font-semibold text-text-sub-light dark:text-text-sub-dark mb-3 uppercase tracking-wider">
            选择图标
          </label>
          <div className="grid grid-cols-5 gap-2 max-h-[200px] overflow-y-auto no-scrollbar">
            {SIDE_TASK_ICONS.map((icon) => (
              <button
                key={icon.name}
                onClick={() => setSelectedIcon(icon.name)}
                className={`aspect-square rounded-xl flex items-center justify-center transition-all ${
                  selectedIcon === icon.name
                    ? 'bg-primary/10 text-primary border-2 border-primary'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="material-icons-round text-xl">{icon.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50/80 dark:bg-gray-800/30 flex items-center justify-between border-t border-border-light/50 dark:border-border-dark/50">
        <button
          onClick={onCancel}
          className="text-base font-semibold text-text-sub-light hover:text-text-main-light transition-colors py-2 px-1"
        >
          取消
        </button>
        <button
          onClick={handleSubmit}
          className="text-white text-base font-bold px-8 py-3 rounded-xl shadow-soft transition-all active:scale-95"
          style={{ backgroundColor: PRIMARY_COLOR }}
        >
          确认
        </button>
      </div>
    </div>
  );
};

export default SideTaskForm;
