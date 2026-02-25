import React, { useState } from 'react';
import { Task } from '../types';

const ICON_OPTIONS = [
  { emoji: '🛍️', icon: 'shopping_cart' },
  { emoji: '👶', icon: 'child_friendly' },
  { emoji: '📖', icon: 'menu_book' },
  { emoji: '💻', icon: 'laptop_mac' },
  { emoji: '☕', icon: 'coffee' },
  { emoji: '🧘', icon: 'self_improvement' },
  { emoji: '🎨', icon: 'brush' },
  { emoji: '🔥', icon: 'local_fire_department' },
  { emoji: '🎧', icon: 'headset' },
  { emoji: '📷', icon: 'camera_alt' },
  { emoji: '📚', icon: 'menu_book' },
  { emoji: '🎮', icon: 'sports_esports' },
  { emoji: '🍽️', icon: 'restaurant' },
  { emoji: '💼', icon: 'work' },
  { emoji: '🏃', icon: 'fitness_center' },
];

interface TaskFormProps {
  task?: Task | null;
  onSave: (task: Task) => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSave, onCancel }) => {
  const [name, setName] = useState<string>(task?.name || '');
  const [selectedIcon, setSelectedIcon] = useState<string>(task?.icon || '🛍️');
  const [errors, setErrors] = useState<{ name?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { name?: string } = {};
    if (!name.trim()) {
      newErrors.name = '任务名称不能为空';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    const taskData: Task = {
      id: task?.id || Date.now().toString(),
      name: name.trim(),
      icon: selectedIcon,
      createdAt: task?.createdAt || new Date(),
    };
    
    onSave(taskData);
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-center text-slate-800 mb-6">
        {task ? '编辑任务' : '添加自定义任务'}
      </h3>
      
      <div className="mb-6">
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors({ ...errors, name: undefined });
          }}
          className="w-full h-12 px-4 rounded-xl bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-primary/50 text-sm placeholder:text-slate-400 transition-all"
          placeholder="请输入任务名称"
        />
        {errors.name && (
          <p className="mt-1 text-red-500 text-sm">{errors.name}</p>
        )}
      </div>
      
      <div className="mb-8">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">选择图标</p>
        <div className="grid grid-cols-5 gap-3 max-h-[160px] overflow-y-auto no-scrollbar py-1">
          {ICON_OPTIONS.map((option) => (
            <button
              key={option.emoji}
              type="button"
              onClick={() => setSelectedIcon(option.emoji)}
              className={`size-11 rounded-xl flex items-center justify-center ${
                selectedIcon === option.emoji
                  ? 'bg-primary/10 text-primary border-2 border-primary'
                  : 'bg-slate-50 text-slate-400 active:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-xl">{option.icon}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 h-12 rounded-xl border border-slate-100 font-bold text-sm text-slate-500 flex items-center justify-center active:bg-slate-50 transition-colors"
        >
          取消
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          className="flex-1 h-12 rounded-xl bg-primary text-white font-bold text-sm flex items-center justify-center active:opacity-90 shadow-lg shadow-primary/20 transition-all"
        >
          完成
        </button>
      </div>
    </div>
  );
};

export default TaskForm;
