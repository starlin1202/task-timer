/**
 * HomePage 组件
 * 首页 - 任务管理页面
 */

import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import {
  CoreTask,
  SideTask,
  TimerSession,
  TASK_ICON_COLORS,
} from '../types';
import {
  getCoreTask,
  setCoreTask,
  deleteCoreTask,
  getSideTasks,
  addSideTask,
  deleteSideTask,
  reorderSideTasks,
  addTimeRecord,
  getTimerSession,
  setTimerSession,
  initializePresetTasks,
} from '../utils/storage';
import {
  formatTime,
  getTodayString,
  calculateProgress,
  getRemainingDays,
  formatDateDisplay,
  formatHours,
} from '../utils/timeUtils';
import CoreTaskForm from '../components/CoreTaskForm';
import SideTaskForm from '../components/SideTaskForm';
import GlobalTimerBar from '../components/GlobalTimerBar';

const PRIMARY_COLOR = '#F26522';
const PRIMARY_LIGHT = '#FFF3E0';

const HomePage: React.FC = () => {
  // 数据状态
  const [coreTask, setCoreTaskState] = useState<CoreTask | null>(null);
  const [sideTasks, setSideTasksState] = useState<SideTask[]>([]);
  const [timerSession, setTimerSessionState] = useState<TimerSession | null>(null);
  const [activeTaskName, setActiveTaskName] = useState('');

  // UI 状态
  const [showCoreTaskForm, setShowCoreTaskForm] = useState(false);
  const [showSideTaskForm, setShowSideTaskForm] = useState(false);
  const [editingCoreTask, setEditingCoreTask] = useState<CoreTask | null>(null);
  const [, forceUpdate] = useState({});

  // 初始化数据
  useEffect(() => {
    initializePresetTasks();
    setCoreTaskState(getCoreTask());
    setSideTasksState(getSideTasks());
    const session = getTimerSession();
    if (session) {
      setTimerSessionState(session);
      updateActiveTaskName(session);
    }
  }, []);

  // 计时器更新
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerSession?.isRunning && !timerSession.isPaused) {
      interval = setInterval(() => {
        forceUpdate({});
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerSession]);

  // 更新活跃任务名称
  const updateActiveTaskName = (session: TimerSession) => {
    if (session.taskType === 'core') {
      const task = getCoreTask();
      setActiveTaskName(task?.name || '');
    } else {
      const tasks = getSideTasks();
      const task = tasks.find(t => t.id === session.taskId);
      setActiveTaskName(task?.name || '');
    }
  };

  // 开始计时
  const startTimer = (taskId: string, taskType: 'core' | 'side') => {
    const session: TimerSession = {
      taskId,
      taskType,
      startTime: Date.now(),
      elapsedBeforePause: 0,
      isRunning: true,
      isPaused: false,
    };
    setTimerSessionState(session);
    setTimerSession(session);
    updateActiveTaskName(session);
  };

  // 暂停/继续
  const togglePauseResume = useCallback(() => {
    if (!timerSession) return;

    let updatedSession: TimerSession;

    if (timerSession.isPaused) {
      // 继续计时
      updatedSession = {
        ...timerSession,
        startTime: Date.now(),
        isPaused: false,
      };
    } else {
      // 暂停计时
      const now = Date.now();
      const elapsed = now - timerSession.startTime;
      updatedSession = {
        ...timerSession,
        elapsedBeforePause: timerSession.elapsedBeforePause + elapsed,
        isPaused: true,
      };
    }

    setTimerSessionState(updatedSession);
    setTimerSession(updatedSession);
  }, [timerSession]);

  // 停止计时
  const stopTimer = useCallback(() => {
    if (!timerSession) return;

    const now = Date.now();
    const elapsed = timerSession.isPaused
      ? timerSession.elapsedBeforePause
      : now - timerSession.startTime + timerSession.elapsedBeforePause;

    const minutes = Math.round(elapsed / 60000);

    if (minutes > 0) {
      addTimeRecord({
        taskId: timerSession.taskId,
        taskType: timerSession.taskType,
        date: getTodayString(),
        duration: minutes,
        isManual: false,
      });

      // 刷新数据
      setCoreTaskState(getCoreTask());
      setSideTasksState(getSideTasks());
    }

    setTimerSessionState(null);
    setTimerSession(null);
    setActiveTaskName('');
  }, [timerSession]);

  // 保存核心任务
  const handleSaveCoreTask = (task: CoreTask) => {
    setCoreTask(task);
    setCoreTaskState(task);
    setShowCoreTaskForm(false);
    setEditingCoreTask(null);
  };

  // 删除核心任务
  const handleDeleteCoreTask = () => {
    // 使用 setTimeout 确保 confirm 不会阻塞渲染
    setTimeout(() => {
      const confirmed = window.confirm('确定要删除核心任务吗？已记录的时间仍会保留。');
      if (confirmed) {
        deleteCoreTask();
        setCoreTaskState(null);
        setShowCoreTaskForm(false);
        setEditingCoreTask(null);
      }
    }, 0);
  };

  // 添加非核心任务
  const handleAddSideTask = (name: string, icon: string) => {
    addSideTask({ name, icon });
    setSideTasksState(getSideTasks());
    setShowSideTaskForm(false);
  };

  // 删除非核心任务
  const handleDeleteSideTask = (taskId: string, taskName: string) => {
    if (window.confirm(`确定要删除「${taskName}」吗？已记录的时间仍会保留在统计中。`)) {
      deleteSideTask(taskId);
      setSideTasksState(getSideTasks());

      // 如果删除的是正在计时的任务，停止计时
      if (timerSession?.taskId === taskId) {
        stopTimer();
      }
    }
  };

  // 拖拽排序
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;

    const taskIds = sideTasks.map(t => t.id);
    const [removed] = taskIds.splice(result.source.index, 1);
    taskIds.splice(result.destination.index, 0, removed);

    reorderSideTasks(taskIds);
    setSideTasksState(getSideTasks());
  };

  // 检查任务是否正在计时
  const isTaskActive = (taskId: string, taskType: 'core' | 'side') => {
    return timerSession?.taskId === taskId && timerSession?.taskType === taskType;
  };

  return (
    <div className="flex flex-col h-full relative bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="pt-6 pb-4 px-4 flex justify-center items-center sticky top-0 z-10 bg-surface-light dark:bg-surface-dark">
        <h1 className="text-xl font-medium tracking-wide text-text-main-light dark:text-text-main-dark">
          深度聚焦
        </h1>
      </header>

      {/* Global Timer Bar */}
      <GlobalTimerBar
        session={timerSession}
        taskName={activeTaskName}
        onPauseResume={togglePauseResume}
        onStop={stopTimer}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 pb-32">
        {/* Core Task Section */}
        <section className="mb-8">
          <h3 className="text-lg font-bold mb-3 text-text-main-light dark:text-text-main-dark">
            核心任务
          </h3>

          {coreTask ? (
            <div
              className={`bg-surface-light dark:bg-surface-dark rounded-3xl p-5 shadow-soft relative overflow-hidden ${
                isTaskActive(coreTask.id, 'core')
                  ? 'border-2 border-primary'
                  : 'border border-gray-100 dark:border-gray-800'
              }`}
              style={isTaskActive(coreTask.id, 'core') ? { boxShadow: '0 10px 25px -5px rgba(242, 101, 34, 0.15)' } : {}}
            >
              {/* Task Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
                    {coreTask.name}
                  </h2>
                  <button
                    onClick={() => {
                      setEditingCoreTask(coreTask);
                      setShowCoreTaskForm(true);
                    }}
                    className="text-gray-400 hover:text-primary transition-colors flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </button>
                </div>

                {isTaskActive(coreTask.id, 'core') ? (
                  <button
                    onClick={stopTimer}
                    className="w-10 h-10 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform bg-white border-2"
                    style={{
                      borderColor: PRIMARY_COLOR,
                      boxShadow: '0 10px 15px -3px rgba(242, 101, 34, 0.3)',
                    }}
                  >
                    <span className="material-icons-round text-2xl" style={{ color: PRIMARY_COLOR }}>stop</span>
                  </button>
                ) : coreTask.status === 'active' ? (
                  <button
                    onClick={() => startTimer(coreTask.id, 'core')}
                    className="w-10 h-10 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
                    style={{
                      backgroundColor: PRIMARY_COLOR,
                      boxShadow: '0 10px 15px -3px rgba(242, 101, 34, 0.3)',
                    }}
                  >
                    <span className="material-icons-round text-white text-2xl ml-0.5">play_arrow</span>
                  </button>
                ) : (
                  <span className="text-sm text-gray-400">
                    {coreTask.status === 'abandoned' ? '已放弃' : '已归档'}
                  </span>
                )}
              </div>

              {/* Progress */}
              <div className="flex flex-row justify-between items-end text-sm text-text-sub-light dark:text-text-sub-dark mb-2">
                <div className="text-gray-600 font-medium">已累计投入时长</div>
                <div className="text-right">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {Math.round(coreTask.accumulatedHours)}
                  </span>
                  <span className="text-gray-400 font-normal"> / {coreTask.targetHours} 小时</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full mb-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${calculateProgress(coreTask.accumulatedHours, coreTask.targetHours)}%`,
                    backgroundColor: PRIMARY_COLOR,
                    opacity: isTaskActive(coreTask.id, 'core') ? 1 : 0.6,
                  }}
                />
              </div>

              {/* Task Info */}
              <div className="text-[14px] font-light text-text-sub-light dark:text-text-sub-dark">
                <span>
                  到期日 <span className="text-primary font-medium">{formatDateDisplay(coreTask.endAt)}</span> (共计<span className="text-primary font-medium">{coreTask.totalDays || getRemainingDays(coreTask.endAt)}</span>天)
                  {coreTask.dailyGoal && <>，每天计划投入 <span className="text-primary font-medium">{coreTask.dailyGoal}</span> 小时</>}
                </span>
              </div>
            </div>
          ) : (
            // Empty State
            <button
              onClick={() => {
                setEditingCoreTask(null);
                setShowCoreTaskForm(true);
              }}
              className="w-full aspect-[16/9] bg-white dark:bg-surface-dark border-2 border-dashed border-primary/40 dark:border-primary/30 rounded-3xl flex flex-col items-center justify-center p-6 transition-all active:scale-[0.98] group shadow-sm"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-soft mb-3 group-hover:shadow-lg transition-shadow"
                style={{ backgroundColor: PRIMARY_COLOR }}
              >
                <span className="material-icons-round text-white text-4xl">add</span>
              </div>
              <span className="text-lg font-bold mb-1" style={{ color: PRIMARY_COLOR }}>
                点击添加核心任务
              </span>
              <span className="text-sm text-text-sub-light dark:text-text-sub-dark font-light">
                设定一个聚焦目标，见证自我成长
              </span>
            </button>
          )}
        </section>

        {/* Side Tasks Section */}
        <section className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">
              其他任务
            </h3>
            <button
              onClick={() => setShowSideTaskForm(true)}
              className="w-9 h-9 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="material-icons-round text-gray-600 dark:text-gray-300 text-xl">add</span>
            </button>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="side-tasks" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="grid grid-cols-3 gap-2.5 pb-6"
                >
                  {sideTasks.map((task, index) => {
                    const isActive = isTaskActive(task.id, 'side');

                    return (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`bg-surface-light dark:bg-surface-dark rounded-xl flex flex-col shadow-sm p-2 text-center transition-all ${
                              isActive
                                ? 'border-2 border-primary/60'
                                : 'border border-gray-100 dark:border-gray-800'
                            } ${snapshot.isDragging ? 'shadow-lg z-10' : ''}`}
                          >
                            {/* Icon and Name */}
                            <div className="flex flex-col items-center mb-2">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center mb-1"
                                style={{ backgroundColor: task.color.bg, color: task.color.text }}
                              >
                                <span className="material-icons-round text-lg">{task.icon}</span>
                              </div>
                              <span className="text-[12px] font-bold text-gray-800 dark:text-gray-100 truncate w-full px-1">
                                {task.name}
                              </span>
                            </div>

                            {/* Start Button */}
                            {isActive ? (
                              <button
                                onClick={stopTimer}
                                className="w-full py-1.5 rounded-full flex items-center justify-center space-x-0.5 mb-2 active:scale-95 transition-transform"
                                style={{ backgroundColor: PRIMARY_COLOR }}
                              >
                                <span className="material-icons-round text-white text-[14px]">
                                  stop
                                </span>
                                <span className="text-[11px] font-bold text-white">
                                  停止
                                </span>
                              </button>
                            ) : (
                              <button
                                onClick={() => startTimer(task.id, 'side')}
                                className="w-full py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center space-x-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors active:scale-95 mb-2"
                              >
                                <span className="material-icons-round text-gray-600 dark:text-gray-400 text-[14px]">
                                  play_arrow
                                </span>
                                <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400">
                                  开始
                                </span>
                              </button>
                            )}

                            {/* Actions */}
                            <div className="flex justify-between items-center px-1 border-t border-gray-100 dark:border-gray-800 pt-1.5">
                              <div
                                {...provided.dragHandleProps}
                                className="text-gray-400 dark:text-gray-500 cursor-grab active:cursor-grabbing"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  drag_indicator
                                </span>
                              </div>
                              <button
                                onClick={() => handleDeleteSideTask(task.id, task.name)}
                                className="text-red-500 dark:text-red-400 hover:text-red-600 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  delete
                                </span>
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </section>
      </main>

      {/* Core Task Form Modal */}
      {showCoreTaskForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-[2px]">
          <CoreTaskForm
            task={editingCoreTask}
            onSave={handleSaveCoreTask}
            onCancel={() => {
              setShowCoreTaskForm(false);
              setEditingCoreTask(null);
            }}
            onDelete={editingCoreTask ? handleDeleteCoreTask : undefined}
          />
        </div>
      )}

      {/* Side Task Form Modal */}
      {showSideTaskForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-[2px]">
          <SideTaskForm
            onSave={handleAddSideTask}
            onCancel={() => setShowSideTaskForm(false)}
          />
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.9);
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
