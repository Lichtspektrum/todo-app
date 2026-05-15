# Changelog

## [1.5.0] — 2026-05-15

### 字体

- Nothing 品牌新增 **Sarasa Mono SC**（等距更纱黑体 SC）作为中文字形，与 Space Mono 共享等宽度量，中英文同行排版终于齐整。Latin 仍走 Space Mono，CJK 走 Sarasa，由 `unicode-range` 自动按字符分流
- 字体仅在 Nothing 品牌 + 出现 CJK 字符时按需下载（3.8 MB woff2，从上游 25 MB TTF 子集化后压缩），未进 Nothing 品牌的用户完全不下载

### 修复

- 修复 `<html lang>` 始终为 `"zh"`、不随语言切换更新的问题。`LangContext` 现在通过 `useEffect` 同步 `document.documentElement.lang`，对屏幕阅读器和 `:lang()` CSS 选择器都更友好

### 内部变更

- 新增 `public/fonts/SarasaMonoSC-Regular.woff2`，通过 `@font-face` 声明，`unicode-range` 限定 CJK 统一表意文字、扩展 A、部首补充、CJK 符号标点、半宽全宽形式
- `vite.config.ts` 的 workbox：Sarasa 字体从 precache 中排除（`globIgnores`），改用 `CacheFirst` runtime 缓存（`/fonts/*.woff2`，1 年 TTL）。避免给不用 Nothing 品牌的用户白白塞进 PWA precache

---

## [1.4.0] — 2026-04-23

### 主题系统重构

- 主题模型拆为两个正交维度：**品牌**（Anthropic / Nothing）× **明暗**（Light / Dark），共 4 种组合
- **新增 Nothing 亮色模式**：纯白底 + 黑色点阵纹理 + 红色 accent，保持直角边框与 Space Mono 字体
- 头部改为**两个独立切换按钮**——左侧切换品牌，右侧切换明暗，取代原先的三态循环按钮
- 两个维度的选择各自持久化（`localStorage` 中分别存 `brand` 与 `mode`），并保留对旧 `theme` 键的迁移

### 内部变更

- `ThemeContext` 重写：`{theme, toggleTheme}` → `{brand, mode, toggleBrand, toggleMode}`
- CSS 选择器切换：`[data-theme="dark"]` → `[data-mode="dark"]`；`[data-theme="nothing"]` → `[data-brand="nothing"]`（必要时叠加 `[data-mode]`）
- 新增 `switchToAnthropic` i18n 字符串（中英）

---

## [1.3.0] — 2026-04-04

### 新增

- 🎨 Nothing 主题：纯黑背景 + 白色点阵纹理，`Space Mono` 等宽字体，全面去除圆角
- 主题切换改为三态循环：浅色 → 深色 → Nothing → 浅色
- Nothing 模式下切换按钮显示 3×3 红色点阵图标

### 内部变更

- `Theme` 类型扩展为 `'light' | 'dark' | 'nothing'`，localStorage 兼容三态持久化
- 新增 `[data-theme="nothing"]` CSS 变量块，涵盖全部颜色令牌
- 修复 Toast 硬编码颜色，改为 `--toast-bg` / `--toast-text` CSS 变量
- 引入 Google Fonts Space Mono（仅在 Nothing 主题下生效）

---

## [1.2.0] — 2026-03-19

### 其他

- 页面底部新增赞助入口，点击弹出支付宝收款码

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
