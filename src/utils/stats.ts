/**
 * Stats 模块
 * 统计数据计算工具函数
 */

import { TimeRecord, TaskStatItem, StatsPeriod, TaskType } from '../types';
import { getTimeRecords, getCoreTask, getSideTasks } from './storage';
import { isThisWeek, isThisMonth, isToday, formatDateToString, isSameDay, parseDateString } from './timeUtils';

/**
 * 按日汇总统计数据
 * @param date 指定日期，默认为今天
 * @returns 任务ID到总时长的映射
 */
export const getDailyStats = (date: Date = new Date()): Record<string, number> => {
  const records = getTimeRecords();

  const stats: Record<string, number> = {};
  records
    .filter(record => {
      // 使用 isSameDay 比较日期，避免字符串格式问题
      const recordDate = parseDateString(record.date);
      return isSameDay(recordDate, date);
    })
    .forEach(record => {
      if (!stats[record.taskId]) {
        stats[record.taskId] = 0;
      }
      stats[record.taskId] += record.duration * 60 * 1000; // 转换为毫秒
    });

  return stats;
};

/**
 * 按周汇总统计数据
 * @returns 任务ID到总时长的映射
 */
export const getWeeklyStats = (): Record<string, number> => {
  const records = getTimeRecords();
  
  const stats: Record<string, number> = {};
  records
    .filter(record => isThisWeek(record.date))
    .forEach(record => {
      if (!stats[record.taskId]) {
        stats[record.taskId] = 0;
      }
      stats[record.taskId] += record.duration * 60 * 1000;
    });
  
  return stats;
};

/**
 * 按月汇总统计数据
 * @returns 任务ID到总时长的映射
 */
export const getMonthlyStats = (): Record<string, number> => {
  const records = getTimeRecords();
  
  const stats: Record<string, number> = {};
  records
    .filter(record => isThisMonth(record.date))
    .forEach(record => {
      if (!stats[record.taskId]) {
        stats[record.taskId] = 0;
      }
      stats[record.taskId] += record.duration * 60 * 1000;
    });
  
  return stats;
};

/**
 * 获取指定时间段的统计
 * @param period 统计周期
 * @returns 任务ID到总时长的映射
 */
export const getStatsByPeriod = (period: StatsPeriod): Record<string, number> => {
  switch (period) {
    case 'daily':
      return getDailyStats();
    case 'weekly':
      return getWeeklyStats();
    case 'monthly':
      return getMonthlyStats();
    default:
      return {};
  }
};

/**
 * 获取所有任务的统计汇总
 * @param period 统计周期
 * @returns 任务统计项数组
 */
export const getAllTasksStats = (period: StatsPeriod): TaskStatItem[] => {
  const stats = getStatsByPeriod(period);
  const coreTask = getCoreTask();
  const sideTasks = getSideTasks();
  
  const result: TaskStatItem[] = [];
  
  // 添加核心任务统计
  if (coreTask) {
    result.push({
      taskId: coreTask.id,
      taskName: coreTask.name,
      taskType: 'core',
      totalTime: stats[coreTask.id] || 0,
      percentage: 0, // 后续计算
    });
  }
  
  // 添加非核心任务统计
  sideTasks.forEach(task => {
    result.push({
      taskId: task.id,
      taskName: task.name,
      taskType: 'side',
      totalTime: stats[task.id] || 0,
      percentage: 0,
    });
  });
  
  // 计算百分比
  return calculatePercentages(result);
};

/**
 * 计算百分比
 * @param items 任务统计项数组
 * @returns 计算百分比后的数组
 */
export const calculatePercentages = (items: TaskStatItem[]): TaskStatItem[] => {
  const totalDuration = items.reduce((sum, item) => sum + item.totalTime, 0);
  
  if (totalDuration === 0) {
    return items.map(item => ({ ...item, percentage: 0 }));
  }
  
  return items.map(item => ({
    ...item,
    percentage: (item.totalTime / totalDuration) * 100,
  }));
};

/**
 * 获取总时长
 * @param period 统计周期
 * @returns 总时长（毫秒）
 */
export const getTotalTime = (period: StatsPeriod): number => {
  const stats = getAllTasksStats(period);
  return stats.reduce((sum, item) => sum + item.totalTime, 0);
};

/**
 * 获取图表颜色
 * 根据索引返回对应的颜色
 */
export const CHART_COLORS = [
  '#F26522', // 主色 - 橙色
  '#FF9F5A', // 浅橙
  '#FFCC9D', // 更浅橙
  '#FFE9D6', // 最浅橙
  '#3B82F6', // 蓝色
  '#10B981', // 绿色
  '#8B5CF6', // 紫色
  '#EC4899', // 粉色
  '#F59E0B', // 黄色
  '#06B6D4', // 青色
];

/**
 * 获取任务的颜色
 * @param index 索引
 * @returns 颜色代码
 */
export const getTaskColor = (index: number): string => {
  return CHART_COLORS[index % CHART_COLORS.length];
};
