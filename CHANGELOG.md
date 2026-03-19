# Changelog

## [1.2.0] — 2026-03-19

### 动效

- 任务完成动画：勾选圆圈弹性填充，文字加删除线，优先级竖线淡出
- 删除滑出动画：任务向右滑出，列表高度平滑折叠
- 新建任务滑入：从上方弹性进场
- Toast 通知：操作反馈 + 撤销按钮（删除任务、清空已完成）

### 工程质量

- `React.memo` + `useCallback` 优化，减少无效重渲染
- 可访问性（A11y）：ARIA labels、`aria-pressed`、`aria-checked`、键盘导航
- 单元测试：`useTodos` hook 38 个用例，覆盖 CRUD、撤销、重排、localStorage

### 内部变更

- `useTodos` 新增 `removingIds`、`startRemoveTodo`、`onRemoveComplete`、`undo`、`clearUndo`
- 新增 `useToast` hook 管理单槽 Toast 队列
- i18n 扩展：toast 文案、A11y 动态标签（`markAsDone`、`deleteTask`）
- `animationend` + 300ms 兜底双保险防止动画卡住

---

## [1.1.4] — 2025

初始发布。极简 Todo 应用：任务增删改、拖拽排序、优先级、过滤视图、进度条、深色模式、双语（中/英）、截止日期、localStorage 持久化、响应式布局。
