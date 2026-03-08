/**
 * DeepFocus 类型定义
 * 包含核心任务、非核心任务、时间记录、计时会话等数据模型
 */

// ============ 任务类型 ============

/**
 * 任务周期类型
 */
export type TaskPeriod = 'week' | 'month' | 'year' | 'custom';

/**
 * 核心任务状态
 */
export type CoreTaskStatus = 'active' | 'archived' | 'abandoned';

/**
 * 任务类型
 */
export type TaskType = 'core' | 'side';

/**
 * 核心任务（最多1个）
 * 用户聚焦的主要目标，有周期和目标时长
 */
export interface CoreTask {
  id: string;
  name: string;
  period: TaskPeriod;
  targetHours: number;
  dailyGoal?: number;
  accumulatedHours: number;
  createdAt: number;
  endAt: number;
  status: CoreTaskStatus;
  totalDays: number; // 用户设定的任务总天数
}

/**
 * 非核心任务（无数量限制）
 * 辅助性任务，无周期概念
 */
export interface SideTask {
  id: string;
  name: string;
  icon: string;
  color: { bg: string; text: string }; // 任务固定的图标颜色
  accumulatedHours: number;
  sortOrder: number;
  createdAt: number;
}

// ============ 时间记录类型 ============

/**
 * 时间记录
 * 记录每次计时或手动修正的时间
 */
export interface TimeRecord {
  id: string;
  taskId: string;
  taskType: TaskType;
  date: string; // YYYY-MM-DD 格式
  duration: number; // 分钟
  recordedAt: number;
  isManual: boolean; // 是否手动修正
}

// ============ 计时状态类型 ============

/**
 * 计时会话
 * 用于恢复计时状态，页面刷新后继续保持
 */
export interface TimerSession {
  taskId: string;
  taskType: TaskType;
  startTime: number; // 开始时间戳
  elapsedBeforePause: number; // 暂停前已计时时长（毫秒）
  isRunning: boolean;
  isPaused: boolean;
}

/**
 * 活跃计时器（用于UI展示）
 */
export interface ActiveTimer {
  taskId: string;
  taskType: TaskType;
  taskName: string;
  startTime: number;
  elapsed: number; // 已过去的时间（毫秒）
  isPaused: boolean;
}

// ============ 统计数据类型 ============

/**
 * 任务统计项
 */
export interface TaskStatItem {
  taskId: string;
  taskName: string;
  taskType: TaskType;
  totalTime: number; // 毫秒
  percentage: number;
}

/**
 * 统计周期
 */
export type StatsPeriod = 'daily' | 'weekly' | 'monthly';

// ============ 预置任务配置 ============

/**
 * 预置非核心任务列表
 * 首次使用应用时自动创建
 */
export const PRESET_SIDE_TASKS = [
  { name: '看电视', icon: 'tv' },
  { name: '玩游戏', icon: 'sports_esports' },
  { name: '吃饭', icon: 'restaurant' },
  { name: '通勤', icon: 'commute' },
  { name: '上厕所', icon: 'wc' },
];

/**
 * 非核心任务图标选项
 */
export const SIDE_TASK_ICONS = [
  { name: 'tv', label: '电视' },
  { name: 'sports_esports', label: '游戏' },
  { name: 'restaurant', label: '用餐' },
  { name: 'commute', label: '通勤' },
  { name: 'wc', label: ' restroom' },
  { name: 'menu_book', label: '阅读' },
  { name: 'fitness_center', label: '运动' },
  { name: 'self_improvement', label: '冥想' },
  { name: 'palette', label: '绘画' },
  { name: 'brush', label: '书法' },
  { name: 'headset', label: '音乐' },
  { name: 'coffee', label: '咖啡' },
  { name: 'shopping_cart', label: '购物' },
  { name: 'child_friendly', label: '育儿' },
  { name: 'work', label: '工作' },
  { name: 'laptop_mac', label: '电脑' },
  { name: 'directions_car', label: '驾车' },
  { name: 'home', label: '家务' },
  { name: 'pets', label: '宠物' },
  { name: 'local_cafe', label: '休闲' },
];

/**
 * 图标颜色配置
 * 用于非核心任务卡片
 */
export const TASK_ICON_COLORS = [
  { bg: '#F3E8FF', text: '#9333EA' }, // 紫色
  { bg: '#DBEAFE', text: '#2563EB' }, // 蓝色
  { bg: '#D1FAE5', text: '#059669' }, // 绿色
  { bg: '#FEF3C7', text: '#D97706' }, // 黄色
  { bg: '#FFE4E6', text: '#E11D48' }, // 粉色
  { bg: '#E0E7FF', text: '#4F46E5' }, // 靛蓝
  { bg: '#CCFBF1', text: '#0D9488' }, // 青色
  { bg: '#FED7AA', text: '#EA580C' }, // 橙色
];
