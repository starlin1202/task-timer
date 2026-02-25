import { Task, TimeRecord, ActiveTimer } from '../types';
import { generateId } from '../utils/timeUtils';

const TASKS_STORAGE_KEY = 'task-timer-tasks';
const RECORDS_STORAGE_KEY = 'task-timer-records';

// 初始化默认任务
const DEFAULT_TASKS: Task[] = [
  { id: '1', name: '读书', icon: '📚', color: '#4A90E2', createdAt: new Date() },
  { id: '2', name: '游戏', icon: '🎮', color: '#50C878', createdAt: new Date() },
  { id: '3', name: '吃饭', icon: '🍽️', color: '#FF6B6B', createdAt: new Date() },
  { id: '4', name: '看书', icon: '📖', color: '#9B59B6', createdAt: new Date() },
  { id: '5', name: '工作', icon: '💼', color: '#F39C12', createdAt: new Date() },
  { id: '6', name: '逛街', icon: '🛍️', color: '#1ABC9C', createdAt: new Date() },
  { id: '7', name: '遛娃', icon: '👶', color: '#E74C3C', createdAt: new Date() },
];

// 任务管理
export const getTasks = (): Task[] => {
  try {
    const stored = localStorage.getItem(TASKS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored, (key, value) => {
        if (key === 'createdAt') return new Date(value);
        return value;
      });
    }
    // 如果没有存储的任务，则初始化默认任务
    setTasks(DEFAULT_TASKS);
    return DEFAULT_TASKS;
  } catch (error) {
    console.error('获取任务失败:', error);
    return DEFAULT_TASKS;
  }
};

export const setTasks = (tasks: Task[]): void => {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('保存任务失败:', error);
  }
};

export const addTask = (task: Omit<Task, 'id' | 'createdAt'>): Task => {
  const newTask: Task = {
    ...task,
    id: generateId(),
    createdAt: new Date(),
  };
  
  const tasks = getTasks();
  tasks.push(newTask);
  setTasks(tasks);
  
  return newTask;
};

export const updateTask = (updatedTask: Task): void => {
  const tasks = getTasks();
  const index = tasks.findIndex(task => task.id === updatedTask.id);
  if (index !== -1) {
    tasks[index] = updatedTask;
    setTasks(tasks);
  }
};

export const deleteTask = (taskId: string): void => {
  const tasks = getTasks().filter(task => task.id !== taskId);
  setTasks(tasks);
};

// 时间记录管理
export const getTimeRecords = (): TimeRecord[] => {
  try {
    const stored = localStorage.getItem(RECORDS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored, (key, value) => {
        if (['startTime', 'endTime', 'date'].includes(key)) return new Date(value);
        return value;
      });
    }
    return [];
  } catch (error) {
    console.error('获取时间记录失败:', error);
    return [];
  }
};

export const setTimeRecords = (records: TimeRecord[]): void => {
  try {
    localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error('保存时间记录失败:', error);
  }
};

export const addTimeRecord = (record: Omit<TimeRecord, 'id'>): TimeRecord => {
  const newRecord: TimeRecord = {
    ...record,
    id: generateId(),
  };
  
  const records = getTimeRecords();
  records.push(newRecord);
  setTimeRecords(records);
  
  return newRecord;
};

export const updateTimeRecord = (updatedRecord: TimeRecord): void => {
  const records = getTimeRecords();
  const index = records.findIndex(record => record.id === updatedRecord.id);
  if (index !== -1) {
    records[index] = updatedRecord;
    setTimeRecords(records);
  }
};

export const deleteTimeRecord = (recordId: string): void => {
  const records = getTimeRecords().filter(record => record.id !== recordId);
  setTimeRecords(records);
};

// 清除所有记录
export const clearAllRecords = (): void => {
  try {
    localStorage.removeItem(RECORDS_STORAGE_KEY);
  } catch (error) {
    console.error('清除记录失败:', error);
  }
};

// 获取活动计时器状态
export const getActiveTimer = (): ActiveTimer | null => {
  const activeTimerStr = localStorage.getItem('active-timer');
  if (!activeTimerStr) return null;
  
  try {
    const parsed = JSON.parse(activeTimerStr);
    if (parsed.startTime) parsed.startTime = new Date(parsed.startTime);
    if (parsed.pauseTime) parsed.pauseTime = new Date(parsed.pauseTime);
    return parsed;
  } catch (error) {
    console.error('获取活动计时器失败:', error);
    return null;
  }
};

export const setActiveTimer = (timer: ActiveTimer | null): void => {
  try {
    if (timer) {
      localStorage.setItem('active-timer', JSON.stringify(timer));
    } else {
      localStorage.removeItem('active-timer');
    }
  } catch (error) {
    console.error('保存活动计时器失败:', error);
  }
};