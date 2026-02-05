# 🎬 字幕提取器 - Subtitle Extractor

> 一款功能强大的 Chrome 浏览器扩展，支持从 Bilibili 和 YouTube 视频中提取字幕，并通过 AI 智能生成内容总结。

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue?logo=googlechrome)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ 核心功能

| 功能 | 描述 |
|------|------|
| 🔍 **自动检测** | 自动拦截视频播放时加载的字幕文件，无需手动操作 |
| 📺 **双平台支持** | 完美支持 YouTube（XML/JSON）和 Bilibili（JSON）字幕格式 |
| 💾 **一键下载** | 在弹出窗口中选择字幕语言，点击即可下载为纯文本文件 |
| 🤖 **AI 智能总结** | 集成 OpenAI 兼容 API，实时流式输出视频内容总结 |
| ⚙️ **多配置管理** | 支持保存多个 AI 服务商配置，一键切换 |
| 🎨 **精美界面** | 采用 Apple 设计风格，简洁优雅的用户体验 |

---

## 📦 安装指南

### 方式一：开发者模式安装

1. **下载源码**

   ```bash
   git clone https://github.com/your-repo/subtitle-extractor.git
   ```

2. **加载扩展**
   - 打开 Chrome 浏览器，访问 `chrome://extensions`
   - 开启右上角的 **开发者模式**
   - 点击 **加载已解压的扩展程序**
   - 选择项目中的 `subtitle-extractor` 文件夹

3. **完成安装**
   - 扩展图标会出现在浏览器工具栏
   - 建议将其固定到工具栏以便快速访问

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

| 服务商 | API 地址示例 | 推荐模型 |
|--------|-------------|----------|
| OpenAI | `https://api.openai.com/v1` | `gpt-4o-mini` |
| DeepSeek | `https://api.deepseek.com` | `deepseek-chat` |
| Azure OpenAI | `https://your-resource.openai.azure.com` | 自定义部署 |
| 国内中转站 | 各服务商地址 | 按需选择 |

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
└── README_CN.md         # 本文档
```

---

## 🛠️ 技术栈

- **Chrome Extension Manifest V3**
- **Vanilla JavaScript** (ES6+)
- **CSS3** (Apple Design Language)
- **Server-Sent Events (SSE)** 流式通信

---

## ⚠️ 注意事项

1. **字幕检测前提**：必须在视频播放器中开启字幕，否则无法检测
2. **数据持久性**：刷新或关闭页面后，已检测的字幕列表会被清空
3. **API 费用**：AI 总结功能会消耗 API Token，请注意账户余额
4. **隐私保护**：所有数据仅在本地处理，API Key 安全存储于浏览器

---

## 📝 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| v1.0 | 2026-01 | 初始版本，支持字幕提取和下载 |
| v1.1 | 2026-01 | 新增 AI 智能总结功能 |
| v1.2 | 2026-02 | 新增多配置管理、流式输出、自定义 Prompt |
| v1.3 | 2026-02 | 代码架构优化，CSS 模块化，公共函数提取 |

---

## 📄 开源协议

本项目采用 [MIT License](LICENSE) 开源协议。

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

详细的开发文档请参阅 [DEVELOPMENT.md](DEVELOPMENT.md)。
