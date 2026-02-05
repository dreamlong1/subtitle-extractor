# 🎬 Subtitle Extractor & Summarizer Plugin

[中文](./README.md)

> This is a Chrome browser extension that supports downloading and summarizing subtitles from Bilibili and YouTube.

## 📦 Installation Guide

1. **Download Source Code**

   ```bash
   git clone https://github.com/dreamlong1/subtitle-extractor.git
   ```

2. **Load Extension**
   - Open Chrome browser and visit `chrome://extensions`
   - Enable **Developer mode** in the top right corner
   - Drag and drop the `subtitle-extractor` folder into the page

---

## 🚀 User Guide

### Basic Feature: Extract Subtitles

1. Open a **YouTube** or **Bilibili** video page
2. Ensure **subtitles are enabled** in the video player (Crucial!)
3. Play the video; the extension will automatically detect and intercept subtitle requests
4. Click the extension icon in the toolbar to view detected subtitles
5. Select a language from the dropdown menu and click **Download** to save the subtitle file

### Advanced Feature: AI Smart Summary

1. Click the ⚙️ Settings icon in the top right corner of the popup
2. Add an AI service configuration on the settings page:
   - **Config Name**: Custom identifier (e.g., "DeepSeek")
   - **API Address**: Service interface URL (e.g., `https://api.deepseek.com`)
   - **API Key**: Your API key
   - **Model Name**: e.g., `deepseek-chat`, `gpt-4o-mini`
3. Click **Test Connection** to verify the configuration
4. Return to the video page and click the **Summarize** button
5. The AI will output the summary content in real-time via streaming

---

## 🔧 Supported AI Services

This plugin is compatible with all OpenAI-format APIs:

> ⚠️ **Note**: Reasoning models (like `deepseek-reasoner`) have a slower time-to-first-token; it is recommended to use standard models for faster response.

---

## 📁 Project Structure

```
subtitle-extractor/
├── manifest.json        # Chrome Extension Configuration File (Manifest V3)
├── background.js        # Service Worker - Data Storage & AI Proxy
├── content_script.js    # Content Script - Bridge injected into pages
├── inject.js            # Injected Script - Intercepts network requests
├── popup.html           # Popup Interface
├── popup.js             # Popup Logic
├── popup.css            # Popup Styles
├── utils.js             # Common Utility Functions
├── chrome-api.js        # Chrome API Promise Wrapper
├── options/             # Settings Page
│   ├── options.html
│   ├── options.js
│   └── options.css
├── icons/               # Extension Icon Resources
├── README.md            # Chinese Documentation
└── README_EN.md         # English Documentation
```

---

## 📝 Version History

| Version | Date | Update Content |
|---------|------|----------------|
| v1.0 | 2026-02-05 | Initial release, supports subtitle extraction and download |

---

For detailed development documentation, please refer to [DEVELOPMENT.md](DEVELOPMENT.md).
