/**
 * Time Utils 模块
 * 时间格式化、日期计算工具函数
 */

import { TimeRecord, StatsPeriod } from '../types';

/**
 * 生成唯一ID
 * @returns 唯一ID字符串
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

/**
 * 格式化毫秒为 HH:mm:ss
 * @param milliseconds 毫秒数
 * @returns 格式化后的时间字符串
 */
export const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * 格式化毫秒为用户友好的文本
 * @param milliseconds 毫秒数
 * @returns 格式化后的文本，如 "2小时30分钟"
 */
export const formatDuration = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}小时${minutes > 0 ? ` ${minutes}分钟` : ''}`;
  } else if (minutes > 0) {
    return `${minutes}分钟`;
  } else {
    return '少于1分钟';
  }
};

/**
 * 格式化小时数为友好文本
 * @param hours 小时数
 * @returns 格式化后的文本
 */
export const formatHours = (hours: number): string => {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes}分钟`;
  }
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  if (minutes > 0) {
    return `${wholeHours}小时 ${minutes}分钟`;
  }
  return `${wholeHours}小时`;
};

/**
 * 获取今天的日期字符串（YYYY-MM-DD）
 * @returns 日期字符串
 */
export const getTodayString = (): string => {
  return formatDateToString(new Date());
};

/**
 * 将 Date 格式化为 YYYY-MM-DD
 * @param date 日期对象
 * @returns 日期字符串
 */
export const formatDateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 解析 YYYY-MM-DD 字符串为 Date
 * @param dateString 日期字符串
 * @returns Date 对象
 */
export const parseDateString = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * 获取今天的开始时间
 * @returns Date 对象，时间为 00:00:00
 */
export const getTodayStart = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

/**
 * 获取本周的开始时间（周一）
 * @returns Date 对象
 */
export const getWeekStart = (): Date => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (周日) 到 6 (周六)
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysToSubtract);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

/**
 * 获取本周的结束时间（周日）
 * @returns Date 对象
 */
export const getWeekEnd = (): Date => {
  const weekStart = getWeekStart();
  const sunday = new Date(weekStart);
  sunday.setDate(weekStart.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
};

/**
 * 获取本月的开始时间
 * @returns Date 对象
 */
export const getMonthStart = (): Date => {
  const today = new Date();
  today.setDate(1);
  today.setHours(0, 0, 0, 0);
  return today;
};

/**
 * 获取本月的结束时间
 * @returns Date 对象
 */
export const getMonthEnd = (): Date => {
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  lastDay.setHours(23, 59, 59, 999);
  return lastDay;
};

/**
 * 检查两个日期是否为同一天
 * @param date1 日期1
 * @param date2 日期2
 * @returns 是否为同一天
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * 检查日期是否在本周内
 * @param date 日期对象或字符串
 * @returns 是否在本周内
 */
export const isThisWeek = (date: Date | string): boolean => {
  const checkDate = typeof date === 'string' ? parseDateString(date) : date;
  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd();
  return checkDate >= weekStart && checkDate <= weekEnd;
};

/**
 * 检查日期是否在本月内
 * @param date 日期对象或字符串
 * @returns 是否在本月内
 */
export const isThisMonth = (date: Date | string): boolean => {
  const checkDate = typeof date === 'string' ? parseDateString(date) : date;
  const monthStart = getMonthStart();
  const monthEnd = getMonthEnd();
  return checkDate >= monthStart && checkDate <= monthEnd;
};

/**
 * 检查日期是否是今天
 * @param date 日期对象或字符串
 * @returns 是否是今天
 */
export const isToday = (date: Date | string): boolean => {
  const checkDate = typeof date === 'string' ? parseDateString(date) : date;
  return isSameDay(checkDate, new Date());
};

/**
 * 计算两个日期之间的天数差
 * @param date1 日期1
 * @param date2 日期2
 * @returns 天数差
 */
export const daysBetween = (date1: Date, date2: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000;
  const diff = Math.abs(date1.getTime() - date2.getTime());
  return Math.round(diff / oneDay);
};

/**
 * 计算剩余天数
 * @param endDate 结束日期（时间戳）
 * @returns 剩余天数
 */
export const getRemainingDays = (endDate: number): number => {
  const now = Date.now();
  const remaining = endDate - now;
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / (24 * 60 * 60 * 1000));
};

/**
 * 格式化日期为显示文本
 * @param date 日期对象或字符串
 * @returns 格式化后的文本，如 "2026.3.30"
 */
export const formatDateDisplay = (date: Date | string | number): string => {
  const d = typeof date === 'number' ? new Date(date) : 
            typeof date === 'string' ? parseDateString(date) : date;
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${year}.${month}.${day}`;
};

/**
 * 根据周期类型计算结束时间
 * @param startDate 开始时间
 * @param period 周期类型
 * @returns 结束时间戳
 */
export const calculateEndDate = (startDate: number, period: 'week' | 'month' | 'year'): number => {
  const start = new Date(startDate);
  const end = new Date(start);
  
  switch (period) {
    case 'week':
      end.setDate(start.getDate() + 7);
      break;
    case 'month':
      end.setMonth(start.getMonth() + 1);
      break;
    case 'year':
      end.setFullYear(start.getFullYear() + 1);
      break;
  }
  
  return end.getTime();
};

/**
 * 计算进度百分比
 * @param current 当前值
 * @param target 目标值
 * @returns 百分比（0-100）
 */
export const calculateProgress = (current: number, target: number): number => {
  if (target <= 0) return 0;
  const percentage = (current / target) * 100;
  return Math.min(Math.max(percentage, 0), 100);
};

/**
 * 验证日期字符串是否有效
 * @param dateString 日期字符串（YYYY-MM-DD）
 * @returns 是否有效
 */
export const isValidDateString = (dateString: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = parseDateString(dateString);
  const [year, month, day] = dateString.split('-').map(Number);
  
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

/**
 * 检查日期是否是未来日期
 * @param dateString 日期字符串
 * @returns 是否是未来日期
 */
export const isFutureDate = (dateString: string): boolean => {
  const date = parseDateString(dateString);
  const today = getTodayStart();
  return date > today;
};
