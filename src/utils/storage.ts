/**
 * Storage 模块
 * 负责 LocalStorage 数据持久化
 * 包含核心任务、非核心任务、时间记录、计时会话的管理
 */

import {
  CoreTask,
  SideTask,
  TimeRecord,
  TimerSession,
  PRESET_SIDE_TASKS,
  TaskType,
  TASK_ICON_COLORS,
} from '../types';

// LocalStorage 键名
const STORAGE_KEYS = {
  CORE_TASK: 'deepfocus_core_task',
  SIDE_TASKS: 'deepfocus_side_tasks',
  TIME_RECORDS: 'deepfocus_time_records',
  TIMER_SESSION: 'deepfocus_timer_session',
  IS_FIRST_VISIT: 'deepfocus_is_first_visit',
} as const;

// ============ 核心任务操作 ============

/**
 * 获取核心任务
 * @returns 核心任务对象或 null
 */
export const getCoreTask = (): CoreTask | null => {
  const data = localStorage.getItem(STORAGE_KEYS.CORE_TASK);
  return data ? JSON.parse(data) : null;
};

/**
 * 保存核心任务
 * @param task 核心任务对象或 null（删除）
 */
export const setCoreTask = (task: CoreTask | null): void => {
  if (task) {
    localStorage.setItem(STORAGE_KEYS.CORE_TASK, JSON.stringify(task));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CORE_TASK);
  }
};

/**
 * 删除核心任务
 */
export const deleteCoreTask = (): void => {
  localStorage.removeItem(STORAGE_KEYS.CORE_TASK);
};

/**
 * 更新核心任务累积时长
 * @param hours 要增加的时长（小时）
 */
export const addCoreTaskHours = (hours: number): void => {
  const task = getCoreTask();
  if (task) {
    task.accumulatedHours += hours;
    setCoreTask(task);
  }
};

// ============ 非核心任务操作 ============

/**
 * 获取所有非核心任务
 * @returns 非核心任务数组，按 sortOrder 排序
 */
export const getSideTasks = (): SideTask[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SIDE_TASKS);
  let tasks: SideTask[] = data ? JSON.parse(data) : [];
  
  // 数据迁移：为旧数据（没有 color 字段的任务）分配颜色
  let needsUpdate = false;
  tasks = tasks.map((task, index) => {
    if (!task.color) {
      needsUpdate = true;
      return {
        ...task,
        color: TASK_ICON_COLORS[index % TASK_ICON_COLORS.length],
      };
    }
    return task;
  });
  
  // 如果有更新，保存回 localStorage
  if (needsUpdate) {
    setSideTasks(tasks);
  }
  
  return tasks.sort((a: SideTask, b: SideTask) => a.sortOrder - b.sortOrder);
};

/**
 * 保存非核心任务列表
 * @param tasks 非核心任务数组
 */
export const setSideTasks = (tasks: SideTask[]): void => {
  localStorage.setItem(STORAGE_KEYS.SIDE_TASKS, JSON.stringify(tasks));
};

/**
 * 添加非核心任务
 * @param task 非核心任务对象（不含 id、sortOrder、createdAt、color、accumulatedHours）
 * @returns 创建的任务对象
 */
export const addSideTask = (task: Omit<SideTask, 'id' | 'sortOrder' | 'createdAt' | 'color' | 'accumulatedHours'>): SideTask => {
  const tasks = getSideTasks();
  // 为任务分配固定颜色，基于当前任务数量取模
  const colorIndex = tasks.length % TASK_ICON_COLORS.length;
  const newTask: SideTask = {
    ...task,
    id: generateId(),
    accumulatedHours: 0,
    sortOrder: tasks.length,
    color: TASK_ICON_COLORS[colorIndex],
    createdAt: Date.now(),
  };
  tasks.push(newTask);
  setSideTasks(tasks);
  return newTask;
};

/**
 * 更新非核心任务
 * @param updatedTask 更新后的任务对象
 */
export const updateSideTask = (updatedTask: SideTask): void => {
  const tasks = getSideTasks();
  const index = tasks.findIndex(t => t.id === updatedTask.id);
  if (index !== -1) {
    tasks[index] = updatedTask;
    setSideTasks(tasks);
  }
};

/**
 * 删除非核心任务
 * @param taskId 任务ID
 */
export const deleteSideTask = (taskId: string): void => {
  const tasks = getSideTasks();
  const filteredTasks = tasks.filter(t => t.id !== taskId);
  // 重新计算 sortOrder
  filteredTasks.forEach((task, index) => {
    task.sortOrder = index;
  });
  setSideTasks(filteredTasks);
};

/**
 * 更新非核心任务排序
 * @param taskIds 按新顺序排列的任务ID数组
 */
export const reorderSideTasks = (taskIds: string[]): void => {
  const tasks = getSideTasks();
  const taskMap = new Map(tasks.map(t => [t.id, t]));
  const reorderedTasks = taskIds
    .map(id => taskMap.get(id))
    .filter((t): t is SideTask => t !== undefined);
  
  reorderedTasks.forEach((task, index) => {
    task.sortOrder = index;
  });
  setSideTasks(reorderedTasks);
};

/**
 * 更新非核心任务累积时长
 * @param taskId 任务ID
 * @param hours 要增加的时长（小时）
 */
export const addSideTaskHours = (taskId: string, hours: number): void => {
  const tasks = getSideTasks();
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.accumulatedHours += hours;
    setSideTasks(tasks);
  }
};

// ============ 首次访问初始化 ============

/**
 * 检查是否是首次访问
 * @returns 是否首次访问
 */
export const isFirstVisit = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.IS_FIRST_VISIT) !== 'false';
};

/**
 * 初始化预置非核心任务
 * 首次访问时自动创建
 */
export const initializePresetTasks = (): void => {
  if (isFirstVisit()) {
    const tasks: SideTask[] = PRESET_SIDE_TASKS.map((preset, index) => ({
      id: generateId(),
      name: preset.name,
      icon: preset.icon,
      color: TASK_ICON_COLORS[index % TASK_ICON_COLORS.length],
      accumulatedHours: 0,
      sortOrder: index,
      createdAt: Date.now(),
    }));
    setSideTasks(tasks);
    localStorage.setItem(STORAGE_KEYS.IS_FIRST_VISIT, 'false');
  }
};

// ============ 时间记录操作 ============

/**
 * 获取所有时间记录
 * @returns 时间记录数组
 */
export const getTimeRecords = (): TimeRecord[] => {
  const data = localStorage.getItem(STORAGE_KEYS.TIME_RECORDS);
  return data ? JSON.parse(data) : [];
};

/**
 * 保存时间记录列表
 * @param records 时间记录数组
 */
export const setTimeRecords = (records: TimeRecord[]): void => {
  localStorage.setItem(STORAGE_KEYS.TIME_RECORDS, JSON.stringify(records));
};

/**
 * 添加时间记录
 * @param record 时间记录对象（不含 id、recordedAt）
 * @returns 创建的记录对象
 */
export const addTimeRecord = (
  record: Omit<TimeRecord, 'id' | 'recordedAt'>
): TimeRecord => {
  const records = getTimeRecords();
  const newRecord: TimeRecord = {
    ...record,
    id: generateId(),
    recordedAt: Date.now(),
  };
  records.push(newRecord);
  setTimeRecords(records);
  
  // 同步更新任务累积时长
  const hours = record.duration / 60;
  if (record.taskType === 'core') {
    addCoreTaskHours(hours);
  } else {
    addSideTaskHours(record.taskId, hours);
  }
  
  return newRecord;
};

/**
 * 修正时间记录（增加或减少）
 * @param taskId 任务ID
 * @param taskType 任务类型
 * @param date 日期（YYYY-MM-DD）
 * @param minutes 分钟数（正数增加，负数减少）
 * @returns 是否成功
 */
export const correctTimeRecord = (
  taskId: string,
  taskType: TaskType,
  date: string,
  minutes: number
): boolean => {
  const records = getTimeRecords();
  
  // 查找该日期该任务的记录
  const existingRecord = records.find(
    r => r.taskId === taskId && r.date === date && r.isManual
  );
  
  if (existingRecord) {
    // 更新现有记录
    const newDuration = existingRecord.duration + minutes;
    if (newDuration < 0) {
      return false; // 不能减到负数
    }
    existingRecord.duration = newDuration;
    
    // 如果 duration 为 0，删除记录
    if (newDuration === 0) {
      const index = records.indexOf(existingRecord);
      records.splice(index, 1);
    }
  } else {
    // 创建新记录
    if (minutes < 0) {
      return false; // 新记录不能是负数
    }
    if (minutes > 0) {
      records.push({
        id: generateId(),
        taskId,
        taskType,
        date,
        duration: minutes,
        recordedAt: Date.now(),
        isManual: true,
      });
    }
  }
  
  setTimeRecords(records);
  
  // 同步更新任务累积时长
  const hours = minutes / 60;
  if (taskType === 'core') {
    addCoreTaskHours(hours);
  } else {
    addSideTaskHours(taskId, hours);
  }
  
  return true;
};

/**
 * 获取指定日期、指定任务的已记录时长
 * @param taskId 任务ID
 * @param date 日期（YYYY-MM-DD）
 * @returns 时长（分钟）
 */
export const getRecordedMinutesForDate = (taskId: string, date: string): number => {
  const records = getTimeRecords();
  return records
    .filter(r => r.taskId === taskId && r.date === date)
    .reduce((sum, r) => sum + r.duration, 0);
};

// ============ 计时会话操作 ============

/**
 * 获取当前计时会话
 * @returns 计时会话对象或 null
 */
export const getTimerSession = (): TimerSession | null => {
  const data = localStorage.getItem(STORAGE_KEYS.TIMER_SESSION);
  return data ? JSON.parse(data) : null;
};

/**
 * 保存计时会话
 * @param session 计时会话对象
 */
export const setTimerSession = (session: TimerSession | null): void => {
  if (session) {
    localStorage.setItem(STORAGE_KEYS.TIMER_SESSION, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEYS.TIMER_SESSION);
  }
};

/**
 * 清除所有统计数据
 * 保留任务本身，但清空所有时间记录和累积时长
 */
export const clearAllStats = (): void => {
  // 清空时间记录
  localStorage.removeItem(STORAGE_KEYS.TIME_RECORDS);
  
  // 重置核心任务累积时长
  const coreTask = getCoreTask();
  if (coreTask) {
    coreTask.accumulatedHours = 0;
    if (coreTask.status === 'archived' || coreTask.status === 'abandoned') {
      // 已结束的任务保持状态
    }
    setCoreTask(coreTask);
  }
  
  // 重置非核心任务累积时长
  const sideTasks = getSideTasks();
  sideTasks.forEach(task => {
    task.accumulatedHours = 0;
  });
  setSideTasks(sideTasks);
  
  // 清除计时会话
  localStorage.removeItem(STORAGE_KEYS.TIMER_SESSION);
};

// ============ 辅助函数 ============

/**
 * 生成唯一ID
 * @returns 唯一ID字符串
 */
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

/**
 * 导出所有数据（用于备份）
 * @returns 包含所有数据的 JSON 字符串
 */
export const exportData = (): string => {
  const data = {
    coreTask: getCoreTask(),
    sideTasks: getSideTasks(),
    timeRecords: getTimeRecords(),
    exportTime: Date.now(),
  };
  return JSON.stringify(data, null, 2);
};

/**
 * 导入数据（用于恢复）
 * @param jsonData JSON 字符串
 * @returns 是否成功
 */
export const importData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    if (data.coreTask) setCoreTask(data.coreTask);
    if (data.sideTasks) setSideTasks(data.sideTasks);
    if (data.timeRecords) setTimeRecords(data.timeRecords);
    return true;
  } catch {
    return false;
  }
};
