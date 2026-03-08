# 任务计时器应用

## 项目概述
这是一个简单易用的任务计时器应用，帮助用户追踪不同任务所花费的时间。用户可以自定义任务，启动/暂停/停止计时，并查看历史记录统计。应用界面完全基于Figma设计稿实现。

## 功能特性
- 首页显示预设任务列表（读书、游戏、吃饭、看书、工作、逛街、遛娃等）
- 支持用户自定义新任务（可选择图标和输入名称）
- 任务可通过拖拽调整优先级顺序
- 点击任务启动计时器，顶部显示计时框（含暂停/继续、停止按钮）
- 记录页支持按日、周、月查看各任务累计耗时
- 提供清除历史记录功能
- 完全基于Figma设计稿的现代化UI设计

## 核心任务管理（新增）
- 支持设定核心任务，用于聚焦主要目标
- 核心任务可设定目标时长和计划天数
- 提供全局计时器，实时追踪核心任务进度
- 支持手动修正时间记录
- 提供详细的数据统计和可视化分析

## 技术栈
- React 18.2.0
- TypeScript 4.9.3
- Vite 4.1.0
- Tailwind CSS 3.x
- react-beautiful-dnd (用于拖拽排序)
- date-fns (日期处理)
- react-router-dom (路由管理)

## 项目结构
```
task-timer/
├── public/
│   └── index.html
├── src/
│   ├── components/     # 可复用组件
│   │   ├── TaskTimer.tsx
│   │   └── TaskForm.tsx
│   ├── pages/          # 页面组件
│   │   ├── HomePage.tsx
│   │   └── RecordsPage.tsx
│   ├── utils/          # 工具函数
│   │   ├── timeUtils.ts
│   │   ├── storage.ts
│   │   └── stats.ts
│   ├── styles/         # 样式文件
│   │   ├── index.css
│   │   └── designTokens.ts
│   ├── types/          # 类型定义
│   │   └── index.ts
│   ├── App.tsx         # 主应用组件
│   └── main.tsx        # 应用入口文件
├── README.md
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── tailwind.config.js
└── postcss.config.js
```

## 安装与运行

### 环境要求
- Node.js 16+ 
- npm 或 yarn

### 安装步骤
```bash
# 克隆项目
git clone <repository-url>
cd task-timer

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 功能说明

### 首页功能
1. **任务列表**：显示所有任务，支持拖拽排序
2. **计时控制**：点击任务开始计时，顶部显示计时器
3. **计时器操作**：支持暂停/继续、停止操作
4. **添加任务**：点击"添加任务"按钮，可自定义任务名称、图标和颜色
5. **编辑任务**：点击任务旁的编辑按钮，可修改任务信息

### 核心任务管理功能
1. **设定核心任务**：点击"添加核心任务"按钮，可创建核心任务
   - 输入任务名称
   - 设置任务天数（默认为0）
   - 设置每天计划投入时间（默认为0）
   - 自动计算总投入时长
2. **编辑核心任务**：已创建的核心任务可修改信息
3. **删除核心任务**：支持删除核心任务，已记录时间保留
4. **全局计时器**：顶部显示核心任务的实时计时信息
5. **时间修正**：支持手动修正已记录的时间

### 记录页功能
1. **时间统计**：按日、周、月查看各任务累计耗时
2. **可视化展示**：使用进度条显示各任务占比
3. **清除记录**：一键清除所有历史记录

## 数据模型

### Task 任务对象
- `id`: 任务唯一标识符
- `name`: 任务名称
- `icon`: 任务图标（emoji或字符）
- `color`: 任务颜色主题
- `createdAt`: 创建时间

### TimeRecord 时间记录对象
- `id`: 记录唯一标识符
- `taskId`: 关联的任务ID
- `startTime`: 开始时间
- `endTime`: 结束时间
- `duration`: 持续时间（毫秒）
- `date`: 记录日期

### ActiveTimer 活动计时器对象
- `taskId`: 正在计时的任务ID
- `startTime`: 开始时间
- `elapsed`: 已经过的时间
- `isPaused`: 是否暂停
- `pauseTime`: 暂停时间
- `totalPausedDuration`: 总暂停时间

## 存储机制
应用使用浏览器的 localStorage 进行数据持久化：
- 任务数据存储在 `task-timer-tasks` 键下
- 时间记录存储在 `task-timer-records` 键下
- 活动计时器状态存储在 `active-timer` 键下

## 设计实现
应用界面完全基于Figma设计稿实现，包括：
- 现代化的卡片设计
- 统一的配色方案
- 流畅的交互动画
- 响应式布局

## 已知问题修复
- ✅ 修复了Tailwind CSS配置错误
- ✅ 修复了TypeScript编译配置问题
- ✅ 优化了开发服务器性能
- ✅ 确保了跨浏览器兼容性

## 最近更新（2026-03-04）
- ✅ 核心任务弹窗优化：
  - 移除任务周期选项（周/月/年），简化为自定义周期
  - 任务天数、每天计划投入时间输入框默认值改为0
  - "每天计划 (h)" 文案改为"每天计划投入时间"
- ✅ 类型定义更新：TaskPeriod 类型新增 'custom' 选项

## 进度记录
- [x] 项目初始化
- [x] 首页开发
- [x] 记录页开发
- [x] 数据模型设计
- [x] 功能联调
- [x] Figma设计稿集成
- [x] 问题修复和优化
- [ ] 测试部署

## 访问应用
开发环境：http://localhost:5173/

## 贡献指南
欢迎提交Issue和Pull Request来改进这个项目！