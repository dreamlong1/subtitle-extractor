# 🎬 字幕提取总结插件

[English](./README_EN.md)

> 这是一个 Chrome 浏览器扩展，支持下载和总结 Bilibili 和 YouTube 字幕。

## 📦 安装指南

1. **下载源码**

   ```bash
   git clone https://github.com/dreamlong1/subtitle-extractor.git
   ```

2. **加载扩展**
   - 打开 Chrome 浏览器，访问 `chrome://extensions`
   - 开启右上角的 **开发者模式**
   - 将 `subtitle-extractor` 文件夹拖入即可

---

## 🚀 使用教程

### 基础功能：提取字幕

1. 打开一个 **YouTube** 或 **Bilibili** 视频页面
2. 确保视频播放器中**已开启字幕**（这是关键！）
3. 播放视频，扩展会自动检测并拦截字幕请求
4. 点击工具栏的扩展图标，查看已检测到的字幕
5. 从下拉菜单中选择语言，点击 **下载** 保存字幕文件

### 高级功能：AI 智能总结

1. 点击弹窗右上角的 ⚙️ 设置图标
2. 在设置页面添加 AI 服务配置：
   - **配置名称**：自定义标识（如"DeepSeek"）
   - **API 地址**：服务接口 URL（如 `https://api.deepseek.com`）
   - **API Key**：你的 API 密钥
   - **模型名称**：如 `deepseek-chat`、`gpt-4o-mini`
3. 点击 **连接测试** 验证配置
4. 返回视频页面，点击 **总结** 按钮
5. AI 将以流式方式实时输出总结内容

---

## 🔧 支持的 AI 服务

本插件兼容所有 OpenAI 格式的 API：

> ⚠️ **注意**：推理模型（如 `deepseek-reasoner`）首字输出较慢，建议使用普通模型以获得更快响应。

---

## 📁 项目结构

```
subtitle-extractor/
├── manifest.json        # Chrome 扩展配置文件 (Manifest V3)
├── background.js        # Service Worker - 数据存储与 AI 代理
├── content_script.js    # 内容脚本 - 注入页面的桥接器
├── inject.js            # 注入脚本 - 拦截网络请求
├── popup.html           # 弹出窗口界面
├── popup.js             # 弹出窗口逻辑
├── popup.css            # 弹出窗口样式
├── utils.js             # 公共工具函数
├── chrome-api.js        # Chrome API Promise 封装
├── options/             # 设置页面
│   ├── options.html
│   ├── options.js
│   └── options.css
├── icons/               # 扩展图标资源
├── README.md            # 中文文档
└── README_EN.md         # 英文文档
```

---

## 📝 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| v1.0 | 2026-02-05 | 初始版本，支持字幕提取和下载 |

---

详细的开发文档请参阅 [DEVELOPMENT.md](DEVELOPMENT.md)。
