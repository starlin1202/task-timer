// 任务类型定义
export interface Task {
  id: string;
  name: string;
  icon: string; // 图标标识符，可以是emoji或图标名称
  color?: string; // 任务颜色主题
  createdAt: Date;
}

// 计时记录类型定义
export interface TimeRecord {
  id: string;
  taskId: string;
  startTime: Date;
  endTime: Date | null; // 如果为null表示正在计时
  duration: number; // 持续时间（毫秒）
  date: Date; // 记录日期
}

// 当前计时状态类型定义
export interface ActiveTimer {
  taskId: string;
  startTime: Date;
  elapsed: number; // 已过去的时间（毫秒）
  isPaused: boolean;
  pauseTime?: Date; // 暂停时间
  totalPausedDuration: number; // 总暂停时间
}