// 注入 inject.js
const s = document.createElement('script');
s.src = chrome.runtime.getURL('inject.js');
s.onload = function () {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);

// 同步调试设置
function updateDebugMode() {
    chrome.storage.local.get(['debugMode'], (result) => {
        window.postMessage({
            type: 'subtitle-extractor-set-debug',
            value: result.debugMode || false
        }, '*');
    });
}
// 初始同步
updateDebugMode();
// 监听变化
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.debugMode) {
        updateDebugMode();
    }
});

// 监听来自 inject.js 的消息
window.addEventListener('message', function (event) {
    if (event.source !== window || event.data.source !== 'subtitle-extractor-inject') {
        return;
    }

    if (event.data.type === 'subtitle-response') {
        // 发送到 background/popup
        chrome.runtime.sendMessage({
            type: 'subtitle-found',
            data: event.data.data,
            url: event.data.url,
            lang: event.data.lang,
            title: document.title || document.querySelector('meta[property="og:title"]')?.content || "Unknown Video"
        });
        console.log('字幕提取器: 发现字幕来自 ' + event.data.url);
    }
});
