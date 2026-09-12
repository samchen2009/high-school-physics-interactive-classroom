# 高中物理互动课堂

面向上海高中生的静态互动学习网站。首页按高中物理主干章节提供入口，已完成的“静电场”包含动画、图表、实验、推导、例题和情境练习。

## 项目结构

- `dist/index.html`：高中物理互动课堂总入口
- `dist/electrostatics.html`：静电场互动课堂
- `dist/chapter.html`：其他章节的统一预告页
- `dist/portal.css`、`dist/portal.js`：总入口与章节预告页样式、交互
- `dist/styles.css`、`dist/app.js`：静电场课堂样式、交互

## 本地预览

在项目目录运行：

```bash
python3 -m http.server 4173 --directory dist
```

然后访问 `http://127.0.0.1:4173/`。

## CloudBase 部署

静态站点部署目录是 `dist`：

```bash
tcb hosting deploy ./dist -e <你的环境ID> --safe --verify
```
