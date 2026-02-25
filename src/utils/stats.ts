import { TimeRecord, Task } from '../types';
import { 
  getTodayStart, 
  getWeekStart, 
  getMonthStart, 
  isSameDay,
  dateDiff 
} from '../utils/timeUtils';
import { getTimeRecords, getTasks } from '../utils/storage';

// 按日汇总统计数据
export const getDailyStats = (date: Date = new Date()): Record<string, number> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const records = getTimeRecords();
  const dailyRecords = records.filter(
    record => 
      record.date >= startOfDay && 
      record.date <= endOfDay && 
      record.duration > 0
  );
  
  const stats: Record<string, number> = {};
  dailyRecords.forEach(record => {
    if (!stats[record.taskId]) {
      stats[record.taskId] = 0;
    }
    stats[record.taskId] += record.duration;
  });
  
  return stats;
};

// 按周汇总统计数据
export const getWeeklyStats = (date: Date = new Date()): Record<string, number> => {
  const startOfWeek = getWeekStart();
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  const records = getTimeRecords();
  const weeklyRecords = records.filter(
    record => 
      record.date >= startOfWeek && 
      record.date <= endOfWeek && 
      record.duration > 0
  );
  
  const stats: Record<string, number> = {};
  weeklyRecords.forEach(record => {
    if (!stats[record.taskId]) {
      stats[record.taskId] = 0;
    }
    stats[record.taskId] += record.duration;
  });
  
  return stats;
};

// 按月汇总统计数据
export const getMonthlyStats = (date: Date = new Date()): Record<string, number> => {
  const startOfMonth = getMonthStart();
  const endOfMonth = new Date(date);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  endOfMonth.setDate(0); // 设置为上个月最后一天，即本月最后一天
  endOfMonth.setHours(23, 59, 59, 999);
  
  const records = getTimeRecords();
  const monthlyRecords = records.filter(
    record => 
      record.date >= startOfMonth && 
      record.date <= endOfMonth && 
      record.duration > 0
  );
  
  const stats: Record<string, number> = {};
  monthlyRecords.forEach(record => {
    if (!stats[record.taskId]) {
      stats[record.taskId] = 0;
    }
    stats[record.taskId] += record.duration;
  });
  
  return stats;
};

// 获取指定任务在指定时间段内的总时间
export const getTaskTotalTime = (taskId: string, period: 'daily' | 'weekly' | 'monthly', date: Date = new Date()): number => {
  let stats: Record<string, number>;
  
  switch (period) {
    case 'daily':
      stats = getDailyStats(date);
      break;
    case 'weekly':
      stats = getWeeklyStats(date);
      break;
    case 'monthly':
      stats = getMonthlyStats(date);
      break;
    default:
      stats = {};
  }
  
  return stats[taskId] || 0;
};

// 获取所有任务的时间统计汇总
export const getAllTasksStats = (period: 'daily' | 'weekly' | 'monthly', date: Date = new Date()) => {
  const tasks = getTasks();
  let stats: Record<string, number>;
  
  switch (period) {
    case 'daily':
      stats = getDailyStats(date);
      break;
    case 'weekly':
      stats = getWeeklyStats(date);
      break;
    case 'monthly':
      stats = getMonthlyStats(date);
      break;
    default:
      stats = {};
  }
  
  return tasks.map(task => ({
    task,
    totalTime: stats[task.id] || 0,
    percentage: 0 // 后续计算
  }));
};

// 计算百分比
export const calculatePercentages = (taskStats: Array<{ task: any, totalTime: number, percentage: number }>) => {
  const totalDuration = taskStats.reduce((sum, item) => sum + item.totalTime, 0);
  
  if (totalDuration === 0) {
    return taskStats.map(item => ({ ...item, percentage: 0 }));
  }
  
  return taskStats.map(item => ({
    ...item,
    percentage: (item.totalTime / totalDuration) * 100
  }));
};