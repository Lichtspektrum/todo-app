# Todo

[English](#english)

一个极简的待办清单。三套视觉风格随时切换：Anthropic 暖米色调、深色模式、以及 Nothing 工业黑。支持多语言、优先级标记、拖拽排序——功能够用，代码可读。

**[→ 在线体验](https://todo-app-tau-sandy-90.vercel.app)**

![Todo App](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript) ![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat&logo=vite)

## 有什么功能

- **任务管理**：添加、行内编辑、删除，拖拽排序
- **优先级**：高/中/低，用颜色和左侧竖线区分
- **过滤视图**：全部、待办、已完成
- **进度条**：实时显示完成率
- **三套主题**：Anthropic 暖米色 / 深色 / Nothing 工业黑，圆形波纹展开的切换动效
- **多语言**：中文、English（右上角切换）
- **截止日期**：可选，标记逾期任务
- **本地存储**：`localStorage` 同步状态，无须登录
- **响应式**：手机、平板、电脑都能用
- **操作动效**：任务完成/删除/新建均有动画，Toast 通知 + 撤销
- **可访问性**：ARIA 标签、键盘导航
- **赞助**：Footer 扫码支持作者

## 快速开始

**需要：** [Node.js](https://nodejs.org) LTS 版本

**1. Clone 或下载**

```bash
git clone https://github.com/Lichtspektrum/todo-app.git
cd todo-app
```

**2. 安装依赖**

```bash
npm install
```

**3. 开发模式**

```bash
npm run dev
```

打开浏览器访问 `http://localhost:5173`

**生产构建**

```bash
npm run build
npm run preview
```

## 技术栈

- [React 19](https://react.dev) — UI 框架
- [TypeScript](https://www.typescriptlang.org) — 类型安全
- [Vite](https://vite.dev) — 快速构建工具
- [dnd-kit](https://docs.dndkit.com) — 拖拽库
- [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API) — 主题切换动画

## 设计思路

这个项目的目标是写一个"够用"的待办应用，而不是功能堆砌。代码结构简单，易于理解和扩展——适合学习 React、TypeScript、Vite 的工作流。

如果你想：
- **学习**：代码注释不多，但结构清晰，试试修改功能或添加新特性
- **使用**：完全够日常用，开个浏览器标签页就行
- **参考**：设计和交互逻辑都有，可以借鉴

## License

MIT © LichtSpektrum

---

## English

[回到中文](#todo)

A minimal todo app. Three visual themes, switchable at any time: Anthropic warm off-white, dark mode, and Nothing industrial black. Bilingual interface, priority levels, drag-to-reorder. Does what it needs to, and the code stays readable.

**[→ Live Demo](https://todo-app-tau-sandy-90.vercel.app)**

![Todo App](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript) ![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat&logo=vite)

### Features

- **Task management** — add, inline-edit, delete, drag to reorder
- **Priority levels** — high / medium / low, color-coded with a left-edge indicator
- **Filter views** — All, Active, Done
- **Progress bar** — live completion percentage
- **Three themes** — Anthropic warm / dark / Nothing industrial black; circular ripple transition between each
- **Bilingual** — Chinese and English, toggle in the top-right corner
- **Due dates** — optional, overdue tasks are highlighted
- **Local storage** — state persists via `localStorage`, no login required
- **Responsive** — works on mobile, tablet, and desktop
- **Animations** — polished transitions on complete / delete / add, Toast notifications with undo
- **Accessible** — ARIA labels, keyboard navigation

### Getting Started

**Requires:** [Node.js](https://nodejs.org) LTS

**1. Clone**

```bash
git clone https://github.com/Lichtspektrum/todo-app.git
cd todo-app
```

**2. Install**

```bash
npm install
```

**3. Dev server**

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

**Production build**

```bash
npm run build
npm run preview
```

### Tech Stack

- [React 19](https://react.dev) — UI framework
- [TypeScript](https://www.typescriptlang.org) — type safety
- [Vite](https://vite.dev) — build tool
- [dnd-kit](https://docs.dndkit.com) — drag and drop
- [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API) — theme switch animation

### Design Notes

The goal was a todo app that's complete without being bloated. The structure is intentionally simple — a good starting point if you're learning React, TypeScript, or the Vite workflow.

- **Learn** — the code is light on comments but easy to follow; try modifying or extending it
- **Use** — works fine as a daily driver in a browser tab
- **Reference** — design decisions and interaction patterns are all there to borrow

### License

MIT © LichtSpektrum
