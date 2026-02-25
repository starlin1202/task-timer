import React, { useEffect, useState } from 'react';
import { formatTime } from '../utils/timeUtils';
import { getTasks } from '../utils/storage';

interface TaskTimerProps {
  taskId: string;
  elapsedTime: number;
  isPaused: boolean;
  onPauseResume: () => void;
  onStop: () => void;
}

const TaskTimer: React.FC<TaskTimerProps> = ({ 
  taskId, 
  elapsedTime, 
  isPaused, 
  onPauseResume, 
  onStop 
}) => {
  const [time, setTime] = useState<number>(elapsedTime);
  const [taskName, setTaskName] = useState<string>('');
  const [taskIcon, setTaskIcon] = useState<string>('');

  useEffect(() => {
    // 获取任务名称和图标
    const tasks = getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setTaskName(task.name);
      setTaskIcon(task.icon);
    }
  }, [taskId]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (!isPaused) {
      interval = setInterval(() => {
        setTime(prev => prev + 1000); // 每秒更新一次
      }, 1000);
    } else {
      setTime(elapsedTime);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPaused, elapsedTime]);

  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-6">
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl mr-4">
          {taskIcon}
        </div>
        <h2 className="text-2xl font-semibold text-gray-800">{taskName}</h2>
      </div>
      
      <div className="timer-display text-gray-800 mb-8">
        {formatTime(time)}
      </div>
      
      <div className="flex justify-center space-x-4">
        <button
          onClick={onPauseResume}
          className={`btn-warning px-8 py-4 rounded-xl font-semibold text-lg flex items-center ${
            isPaused 
              ? 'bg-green-500 hover:bg-green-600' 
              : 'bg-yellow-500 hover:bg-yellow-600'
          }`}
        >
          <span className="mr-2">{isPaused ? '▶️' : '⏸️'}</span>
          {isPaused ? '继续' : '暂停'}
        </button>
        <button
          onClick={onStop}
          className="btn-danger px-8 py-4 rounded-xl font-semibold text-lg flex items-center"
        >
          <span className="mr-2">⏹️</span>
          停止
        </button>
      </div>
    </div>
  );
};

export default TaskTimer;