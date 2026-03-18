# Todo App 优化设计文档

**日期：** 2026-03-18
**目标：** 作品集展示，面向全栈 / 独立开发者方向
**范围：** 动效打磨 + 工程质量提升，现有功能不变

---

## 背景

项目已具备完整的 Todo 功能（增删改、拖拽、优先级、过滤、深色模式、双语、截止日期、localStorage）。本次优化分两个方向：

1. **交互与动效**：让每次操作都有视觉反馈，提升使用满足感
2. **工程质量**：补充性能优化、可访问性和测试，让代码本身成为作品集亮点

---

## 模块一：动效

### 1.1 任务完成动画

**目标：** 勾选/取消勾选时有有仪式感的视觉反馈

**行为：**
- 勾选圆圈：从空心边框→填充，带弹性 `cubic-bezier` 缩放（scale 0.8 → 1.1 → 1.0）
- 任务文字：同步渐变加删除线（`text-decoration: line-through`），颜色淡化
- 左侧优先级竖线：淡出（opacity 1 → 0.3）
- 取消勾选时动画反向

**实现位置：** `TodoItem.tsx`，纯 CSS transition + keyframes，不引入新依赖

**时长：** 完成动画约 300ms，取消约 200ms

---

### 1.2 删除滑出动画

**目标：** 删除任务时平滑移除，避免列表跳变

**行为：**
- 任务向右滑出（`translateX(0) → translateX(100%)`）+ 淡出
- 同时高度折叠到 0（使用 `grid-template-rows: 1fr → 0fr` 技巧，避免 JS 计算高度）
- 其他任务平滑上移填补空间

**实现方式：**
- 删除时先给元素加 `data-removing` 属性触发动画，`animationend` 回调后再从状态中移除
- 或使用 React 的 `key` + CSS animation + 延迟删除状态

**时长：** 约 250ms

---

### 1.3 Toast 通知

**目标：** 操作反馈 + 可选撤销，提升产品完整感

**触发场景：**
- 添加任务：「已添加任务」
- 删除单条任务：「已删除「xxx」」+ 撤销按钮
- 清空已完成：「已清空 N 项已完成任务」+ 撤销按钮

**组件设计：**
- 新建 `src/components/Toast.tsx`：单个 Toast 的 UI
- 新建 `src/hooks/useToast.ts`：管理 toast 队列（最多同时显示 1 条）
- Toast 从底部滑入，2 秒后自动消失，悬停时暂停倒计时
- 撤销逻辑：在 `useTodos` 中保存上一步快照，撤销时恢复

**样式：** 沿用项目暖米色调，深色背景（`#3d2b1f`）+ 米色文字，与现有设计一致

---

### 1.4 新建任务滑入动画

**目标：** 新任务加入列表时有轻微入场动效

**行为：**
- 新任务从上方（`translateY(-8px)`）滑入原位，同时淡入
- 弹性曲线：`cubic-bezier(0.34, 1.56, 0.64, 1)`（轻微过冲）
- 时长约 300ms

**实现位置：** `TodoItem.tsx`，新任务加 `data-new` 属性，CSS animation 触发后移除

---

## 模块二：工程质量

### 2.1 React.memo + useMemo 性能优化

**目标：** 减少不必要的重渲染，面试可量化讲解

**改动：**
- `TodoItem` 用 `React.memo` 包裹，避免父组件更新时所有 item 重渲染
- `useTodos` 中的过滤/排序列表（`visibleTodos`）用 `useMemo` 缓存，deps 为 `[todos, filter, sortMode, activeTab]`
- 回调函数（`handleAdd`、`toggleTodo`、`deleteTodo` 等）用 `useCallback` 包裹，配合 `React.memo` 生效

**不过度优化：** 只优化明显的热路径，不对每个函数都加 `useCallback`

---

### 2.2 可访问性（A11y）

**目标：** 通过基础 A11y 实践，体现工程规范意识

**改动范围：**
- `TodoItem`：勾选按钮加 `aria-label="标记为完成"` / `aria-checked`，删除按钮加 `aria-label="删除任务"`
- `Filters`：filter 按钮组加 `role="group"` + `aria-label="过滤视图"`，当前选中加 `aria-pressed`
- `InputArea`：输入框加 `aria-label`，提交按钮加描述
- `Header`：主题切换、语言切换按钮加 `aria-label`
- 键盘支持：`TodoItem` 支持 `Enter` 开始编辑，`Escape` 取消编辑，`Delete`/`Backspace` 删除（需 focus 在任务上时）

---

### 2.3 useTodos Hook 单元测试

**目标：** 覆盖核心业务逻辑，测试文件本身即文档

**工具：** Vitest（项目已有 Vite，Vitest 零配置接入）+ `@testing-library/react` 的 `renderHook`

**测试文件：** `src/hooks/useTodos.test.ts`

**测试用例：**

```
useTodos
  ✓ 初始状态为空列表
  ✓ 添加任务
  ✓ 删除任务
  ✓ 切换任务完成状态
  ✓ 更新任务文字
  ✓ 设置优先级
  ✓ 设置截止日期
  ✓ 过滤：全部 / 待办 / 已完成
  ✓ 清空已完成任务
  ✓ localStorage 持久化（mock localStorage）
```

---

## 不在本次范围内

- 新增功能（子任务、标签、搜索、多设备同步等）
- 视觉设计改动（配色、字体、布局）
- 现有功能重构

---

## 文件变更预览

| 文件 | 变更类型 |
|------|---------|
| `src/components/TodoItem.tsx` | 修改：完成动画、删除动画、A11y |
| `src/components/Toast.tsx` | 新增 |
| `src/hooks/useToast.ts` | 新增 |
| `src/hooks/useTodos.ts` | 修改：useCallback、撤销快照、A11y 相关 |
| `src/hooks/useTodos.test.ts` | 新增 |
| `src/components/InputArea.tsx` | 修改：新建滑入动画、A11y |
| `src/components/Filters.tsx` | 修改：A11y |
| `src/components/Header.tsx` | 修改：A11y |
| `src/App.tsx` | 修改：Toast 集成、useMemo |
| `package.json` | 修改：添加 vitest、@testing-library/react |
