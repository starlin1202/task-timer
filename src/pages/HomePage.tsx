import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Task, ActiveTimer } from '../types';
import { getTasks, setTasks, addTimeRecord, getActiveTimer, setActiveTimer, getTimeRecords } from '../utils/storage';
import TaskForm from '../components/TaskForm';

const PRIMARY_COLOR = '#FF7A00';
const PRIMARY_LIGHT = '#FFF7ED';

const TASK_ICON_COLORS = [
  { bg: '#EFF6FF', text: '#3B82F6' },
  { bg: '#FAF5FF', text: '#A855F7' },
  { bg: '#FFF7ED', text: '#F97316' },
  { bg: '#FFF7ED', text: '#FF7A00' },
  { bg: '#ECFDF5', text: '#10B981' },
  { bg: '#FFFBEB', text: '#F59E0B' },
];

const HomePage: React.FC = () => {
  const [tasks, setTasksState] = useState<Task[]>([]);
  const [activeTimer, setActiveTimerState] = useState<ActiveTimer | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [, forceUpdate] = useState({});

  useEffect(() => {
    setTasksState(getTasks());
    const savedTimer = getActiveTimer();
    if (savedTimer) {
      setActiveTimerState(savedTimer);
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer && !activeTimer.isPaused) {
      interval = setInterval(() => {
        forceUpdate({});
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimer]);

  const getCurrentElapsedTime = () => {
    if (!activeTimer) return 0;
    if (activeTimer.isPaused) {
      return activeTimer.elapsed;
    }
    const now = new Date();
    return now.getTime() - activeTimer.startTime.getTime() - activeTimer.totalPausedDuration;
  };

  const startTimer = (taskId: string) => {
    const timer: ActiveTimer = {
      taskId,
      startTime: new Date(),
      elapsed: 0,
      isPaused: false,
      totalPausedDuration: 0,
    };
    setActiveTimerState(timer);
    setActiveTimer(timer);
  };

  const togglePauseResume = () => {
    if (!activeTimer) return;
    const now = new Date();
    let updatedTimer: ActiveTimer;
    
    if (activeTimer.isPaused) {
      updatedTimer = {
        ...activeTimer,
        isPaused: false,
        pauseTime: undefined,
      };
    } else {
      const elapsed = getCurrentElapsedTime();
      updatedTimer = {
        ...activeTimer,
        isPaused: true,
        elapsed,
        pauseTime: now,
      };
    }
    
    setActiveTimerState(updatedTimer);
    setActiveTimer(updatedTimer);
  };

  const stopTimer = () => {
    if (!activeTimer) return;
    const totalDuration = getCurrentElapsedTime();
    
    addTimeRecord({
      taskId: activeTimer.taskId,
      startTime: activeTimer.startTime,
      endTime: new Date(),
      duration: totalDuration,
      date: new Date(),
    });
    
    setActiveTimerState(null);
    setActiveTimer(null);
    
    // 强制刷新以更新今日计时显示
    forceUpdate({});
  };

  const handleAddTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    const updatedTasks = [...tasks, newTask];
    setTasksState(updatedTasks);
    setTasks(updatedTasks);
    setShowTaskForm(false);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    const updatedTasks = tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    );
    setTasksState(updatedTasks);
    setTasks(updatedTasks);
    setEditingTask(null);
    setShowTaskForm(false);
  };

  const handleDeleteTask = (taskId: string, taskName: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasksState(updatedTasks);
    setTasks(updatedTasks);
    
    // 如果删除的是正在进行的任务，则停止计时器
    if (activeTimer && activeTimer.taskId === taskId) {
      setActiveTimerState(null);
      setActiveTimer(null);
    }
  };

  // 处理拖拽结束事件
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;
    
    // 重新排序任务列表
    const reorderedTasks = Array.from(tasks);
    const [removed] = reorderedTasks.splice(sourceIndex, 1);
    reorderedTasks.splice(destinationIndex, 0, removed);
    
    setTasksState(reorderedTasks);
    setTasks(reorderedTasks);
  };

  const getTaskIconColor = (index: number) => {
    return TASK_ICON_COLORS[index % TASK_ICON_COLORS.length];
  };

  const getMaterialIcon = (task: Task) => {
    const iconMap: Record<string, string> = {
      '📚': 'menu_book',
      '🎮': 'sports_esports',
      '🍽️': 'restaurant',
      '📖': 'auto_stories',
      '💼': 'work',
      '🛍️': 'shopping_cart',
      '👶': 'child_friendly',
      '🏃': 'fitness_center',
      '🧘': 'self_improvement',
      '🎨': 'brush',
      '🎸': 'headset',
      '💻': 'laptop_mac',
      '🚗': 'directions_car',
      '🏠': 'home',
      '🐶': 'pets',
      '🐱': 'pets',
      '🌺': 'local_florist',
      '🍎': 'local_cafe',
      '⚽': 'sports_soccer',
      '🎬': 'movie',
      '☕': 'coffee',
      '📷': 'camera_alt',
      '🔥': 'local_fire_department',
    };
    return iconMap[task.icon] || 'task_alt';
  };

  const formatTimeValue = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { hours, minutes, seconds };
  };

  // 计算任务今日的计时时间（毫秒）
  const getTodayTimeForTask = (taskId: string): number => {
    const records = getTimeRecords();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayRecords = records.filter(record => {
      const recordDate = new Date(record.date);
      recordDate.setHours(0, 0, 0, 0);
      return record.taskId === taskId && recordDate.getTime() === today.getTime();
    });
    
    return todayRecords.reduce((total, record) => total + record.duration, 0);
  };

  // 格式化今日计时时间为可读字符串
  const formatTodayTime = (ms: number): string => {
    if (ms === 0) return '0m';
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}小时 ${minutes}分`;
    }
    return `${minutes}分`;
  };

  const activeTask = activeTimer ? tasks.find(t => t.id === activeTimer.taskId) : null;
  const elapsedTime = getCurrentElapsedTime();
  const { hours, minutes, seconds } = formatTimeValue(elapsedTime);

  return (
    <div className="flex flex-col h-full relative">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center justify-center px-5 py-3">
          <h1 className="text-base font-bold tracking-tight">任务计时</h1>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto px-5 pb-32">
        {activeTimer && activeTask && (
          <section className="mt-4 mb-6">
            <div className="bg-white card-shadow border border-slate-100 rounded-2xl p-5">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center gap-2 mb-3">
                  <span className="relative flex h-2.5 w-2.5">
                    <span 
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ backgroundColor: PRIMARY_COLOR }}
                    ></span>
                    <span 
                      className="relative inline-flex rounded-full h-2.5 w-2.5"
                      style={{ backgroundColor: PRIMARY_COLOR }}
                    ></span>
                  </span>
                  <span 
                    className="text-xl font-extrabold uppercase tracking-widest"
                    style={{ color: PRIMARY_COLOR }}
                  >
                    {activeTimer.isPaused ? '已暂停' : '正在计时'}
                  </span>
                </div>
                <h2 className="text-lg font-bold mb-5 text-slate-700">{activeTask.name}</h2>
                <div className="flex gap-2 mb-6 w-full">
                  <TimeUnit value={hours} label="时" />
                  <TimeUnit value={minutes} label="分" />
                  <TimeUnit value={seconds} label="秒" />
                </div>
                <div className="flex w-full gap-3">
                  <button 
                    onClick={togglePauseResume}
                    className="flex-1 h-12 rounded-xl bg-slate-100 font-bold text-sm text-slate-700 flex items-center justify-center gap-2 active:bg-slate-200 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[24px] leading-none">
                      {activeTimer.isPaused ? 'play_arrow' : 'pause'}
                    </span>
                    <span>{activeTimer.isPaused ? '继续' : '暂停'}</span>
                  </button>
                  <button 
                    onClick={stopTimer}
                    className="flex-1 h-12 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 active:opacity-90 transition-all"
                    style={{ 
                      backgroundColor: PRIMARY_COLOR,
                      boxShadow: '0 10px 15px -3px rgba(255, 122, 0, 0.3)'
                    }}
                  >
                    <span className="material-symbols-outlined text-[24px] leading-none">stop</span>
                    <span>停止</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
        
        <section>
          <div className="flex items-center mb-4">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">我的任务</h3>
          </div>
          <DragDropContext 
              onDragEnd={handleDragEnd}
              onDragStart={() => {}}
              onDragUpdate={() => {}}
            >
              <Droppable droppableId="task-list" direction="vertical">
                {(provided) => (
                  <div 
                    className="grid grid-cols-2 gap-3"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {tasks.map((task, index) => {
                    const colors = getTaskIconColor(index);
                    const isActive = activeTimer?.taskId === task.id;
                    const todayTime = getTodayTimeForTask(task.id);
                    return (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div 
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`bg-white card-shadow p-3.5 rounded-xl flex flex-col justify-between h-[120px] border relative transition-all ${
                              snapshot.isDragging ? 'shadow-lg ring-2 ring-orange-200 z-10' : ''
                            }`}
                            style={{ 
                              borderColor: isActive ? 'rgba(255, 122, 0, 0.2)' : '#f1f5f9',
                              borderWidth: isActive ? '2px' : '1px',
                              ...provided.draggableProps.style
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div 
                                className="size-8 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: colors.bg, color: colors.text }}
                              >
                                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 0" }}>
                                  {getMaterialIcon(task)}
                                </span>
                              </div>
                              <button 
                                onClick={() => !isActive && startTimer(task.id)}
                                className="px-2.5 py-1 rounded-full flex items-center justify-center gap-1 transition-colors border"
                                style={{
                                  backgroundColor: isActive ? PRIMARY_COLOR : '#f8fafc',
                                  color: isActive ? '#ffffff' : '#0f172a',
                                  borderColor: isActive ? PRIMARY_COLOR : '#f1f5f9'
                                }}
                              >
                                <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                                  {isActive ? 'timer' : 'play_arrow'}
                                </span>
                                <span className="text-[10px] font-bold">
                                  {isActive ? '进行中' : '开始'}
                                </span>
                              </button>
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-slate-800">{task.name}</h4>
                              <p className="text-[10px] text-slate-400 mt-0.5">今日: {formatTodayTime(todayTime)}</p>
                            </div>
                            <div className="absolute bottom-4 right-4 flex gap-1">
                              <button 
                                onClick={() => handleDeleteTask(task.id, task.name)}
                                className="size-6 rounded-full flex items-center justify-center transition-colors hover:bg-red-50"
                                style={{
                                  backgroundColor: '#fff5f5', // Light red background
                                  color: '#ff0000' // Red text color
                                }}
                                title={`删除任务 "${task.name}"`}
                              >
                                <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                                  delete
                                </span>
                              </button>
                              <div 
                                {...provided.dragHandleProps}
                                className="size-6 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing transition-colors hover:bg-slate-100 select-none touch-none"
                                style={{
                                  backgroundColor: '#f1f5f9', // Light gray background
                                  color: '#64748b', // Slate gray color
                                  WebkitUserSelect: 'none',
                                  userSelect: 'none',
                                  touchAction: 'none'
                                }}
                                title="拖动以调整顺序"
                              >
                                <span className="material-symbols-outlined text-xs pointer-events-none" style={{ fontVariationSettings: "'FILL' 1" }}>
                                  drag_handle
                                </span>
                              </div>
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
      
      {/* Floating Action Button - Positioned relative to the container */}
      <button 
        onClick={() => {
          setEditingTask(null);
          setShowTaskForm(true);
        }}
        className="absolute size-12 rounded-full text-white flex items-center justify-center active:scale-95 transition-transform z-30"
        style={{ 
          backgroundColor: PRIMARY_COLOR,
          boxShadow: '0 10px 25px -5px rgba(255, 122, 0, 0.4)',
          bottom: '80px',
          right: '16px'
        }}
      >
        <span className="material-symbols-outlined text-2xl font-bold">add</span>
      </button>
      
      {showTaskForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></div>
          <div className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl">
            <div className="px-6 pt-7 pb-6">
              <TaskForm 
                task={editingTask}
                onSave={editingTask ? handleUpdateTask : handleAddTask}
                onCancel={() => {
                  setShowTaskForm(false);
                  setEditingTask(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TimeUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="flex-1 flex flex-col items-center gap-1.5">
    <div className="w-full h-16 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100">
      <span className="text-2xl font-mono font-bold text-slate-800">
        {String(value).padStart(2, '0')}
      </span>
    </div>
    <span className="text-[9px] uppercase font-bold text-slate-400">{label}</span>
  </div>
);

export default HomePage;
