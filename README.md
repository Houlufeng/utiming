# 3D模型展示

这是一个基于Three.js的3D模型展示项目，用于展示各种包装盒和瓶子的3D模型。

## 功能特点

- 支持多种3D模型展示（盒子、瓶子等）
- 支持模型贴图切换
- 响应式设计，支持移动端和桌面端
- 流畅的动画效果
- 用户友好的界面

## 技术栈

- Three.js - 3D渲染引擎
- HTML5/CSS3 - 页面布局和样式
- JavaScript - 交互逻辑
- GLTFLoader - 3D模型加载
- DRACOLoader - 模型压缩和解压

## 项目结构

```
├── index.html          # 主页面
├── js/                 # JavaScript库
│   ├── three.min.js
│   ├── OrbitControls-fixed.js
│   ├── DRACOLoader.js
│   ├── GLTFLoader.js
│   ├── jszip.min.js
│   └── axios.min.js
├── models/            # 3D模型文件
├── images/           # 图片资源
│   ├── textures/    # 贴图文件
│   └── ...
└── README.md         # 项目说明文档
```

## 使用说明

1. 克隆项目到本地
2. 使用现代浏览器打开index.html
3. 通过界面上的按钮切换不同的模型和贴图

## 注意事项

- 确保浏览器支持WebGL
- 建议使用Chrome、Firefox等现代浏览器
- 移动端访问时建议使用横屏模式

## 许可证

MIT License 
