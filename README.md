# Todo

A minimal, elegant todo app styled after the Anthropic website aesthetic — warm beige tones, copper-orange accents, and clean typography.

一个简洁的待办事项应用，UI 风格参考 Anthropic 官网——暖米色调、铜橙点缀、干净的排版。

![Todo App](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript) ![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat&logo=vite)

## Features · 功能

- Add, edit (inline), and delete tasks
- Priority levels — high / medium / low with color indicators
- Filter by all / active / done
- Progress bar tracking completion
- Persistent storage via `localStorage`
- Slide-in animation for new items

---

- 添加、行内编辑、删除任务
- 高 / 中 / 低优先级，彩色竖线 + 标签直观区分
- 三种筛选视图：全部 / 待办 / 已完成
- 进度条实时显示完成比例
- `localStorage` 本地持久化
- 新任务入场动画

## Getting Started · 本地运行

**前置条件：** 需要先安装 [Node.js](https://nodejs.org)（点击链接，下载 LTS 版本安装即可）

**1. 下载项目**

点击页面右上角绿色的「Code」按钮 → 选择「Download ZIP」解压，或者用命令行：

```bash
git clone https://github.com/Lichtspektrum/todo-app.git
cd todo-app
```

**2. 安装依赖**

打开终端（macOS 搜索「Terminal」，Windows 搜索「PowerShell」），进入项目文件夹后运行：

```bash
npm install
```

这一步会下载项目所需的代码库，只需执行一次。

**3. 启动**

```bash
npm run dev
```

看到 `Local: http://localhost:5173` 后，在浏览器打开这个地址就可以使用了。

## Stack · 技术栈

- [React 19](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vite.dev)

## License

MIT © LichtSpektrum
