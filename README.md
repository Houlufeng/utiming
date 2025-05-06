# 3D模型展示

这是一个基于Three.js的3D模型展示项目，用于展示各种包装盒和瓶子的3D模型。

## 功能特点

- 支持多种3D模型展示（盒子、瓶子等）
- 支持模型贴图切换
- 响应式设计，支持移动端和桌面端
- 流畅的动画效果
- 用户友好的界面
- 后台管理系统
- 用户留言功能

## 技术栈

### 前端技术
- Three.js - 3D渲染引擎
- HTML5/CSS3 - 页面布局和样式
- JavaScript - 交互逻辑
- GLTFLoader - 3D模型加载
- DRACOLoader - 模型压缩和解压
- Axios - HTTP请求处理

### 后端技术
- PHP 7.4+ - 服务器端编程语言
- MySQL 5.7+ - 数据库管理系统
- Apache/Nginx - Web服务器
- RESTful API - 接口设计规范
- SQLite - 轻量级数据库（用于留言存储）

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
├── api/              # 后端API接口
│   ├── contact.php  # 留言处理接口
│   └── install.php  # 安装脚本
├── admin/           # 后台管理系统
│   └── index.php   # 管理界面
└── README.md        # 项目说明文档
```

## 使用说明

1. 克隆项目到本地
2. 配置Web服务器（Apache/Nginx）
3. 导入数据库结构（使用install.php）
4. 访问index.html查看前台展示
5. 访问admin/index.php进入后台管理

## 后台功能

- 留言管理：查看和处理用户留言
- 系统设置：配置基本参数
- 访问统计：查看访问数据
- 管理员管理：添加和管理后台用户

## 注意事项

- 确保浏览器支持WebGL
- 建议使用Chrome、Firefox等现代浏览器
- 移动端访问时建议使用横屏模式
- PHP版本需要7.4或以上
- 需要开启PHP PDO扩展
- 配置文件权限正确

## 安装要求

- Web服务器：Apache 2.4+ 或 Nginx 1.18+
- PHP >= 7.4
- MySQL >= 5.7
- PHP扩展：PDO、GD、JSON
- 支持WebGL的现代浏览器

## 许可证

MIT License 
