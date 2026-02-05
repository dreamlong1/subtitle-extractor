
document.addEventListener('DOMContentLoaded', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        const key = `subtitles_${currentTab.id}`;

        // Initialize Key


        chrome.storage.local.get([key], (result) => {
            const subtitles = result[key] || [];

            const mainInterface = document.getElementById('main-interface');
            const statusHeader = document.getElementById('status-header');
            const downloadBtn = document.getElementById('download-btn');
            const summarizeBtn = document.getElementById('summarize-btn');
            const settingsBtn = document.getElementById('settings-btn');

            // Dropdown Elements
            const selectWrapper = document.querySelector('.custom-select');
            const selectTrigger = document.querySelector('.custom-select__trigger');
            const selectTriggerSpan = selectTrigger.querySelector('span');
            const optionsContainer = document.querySelector('.custom-options');

            // 1. Navigation Logic - Open Options Page
            settingsBtn.onclick = () => {
                if (chrome.runtime.openOptionsPage) {
                    chrome.runtime.openOptionsPage();
                } else {
                    window.open(chrome.runtime.getURL('options/options.html'));
                }
            };

            if (subtitles.length > 0) {
                console.log('[Popup] 加载字幕:', JSON.stringify(subtitles));

                // Update Status Header to Success
                statusHeader.innerHTML = `
                    <div class="status-success">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        检测成功
                    </div>
                `;

                mainInterface.style.display = 'block';

                // Sort Logic: 中文 > English > Others
                subtitles.sort((a, b) => {
                    const getScore = (s) => {
                        const lang = (s.lang || '').toLowerCase();
                        if (lang.includes('中文') || lang.includes('zh') || lang.includes('chinese')) return 3;
                        if (lang.includes('english') || lang.includes('en')) return 2;
                        return 1;
                    };
                    return getScore(b) - getScore(a);
                });

                // State
                let selectedIndex = 0; // Default to first (best match due to sort)

                // Render Options
                optionsContainer.innerHTML = '';
                subtitles.forEach((sub, index) => {
                    const option = document.createElement('div');
                    option.className = 'custom-option';
                    if (index === selectedIndex) option.classList.add('selected');

                    let langDisplay = sub.lang || 'Unknown';
                    // Enhance text
                    if (sub.url.includes('api/timedtext')) langDisplay += ' (YouTube)';
                    else if (sub.url.includes('bilibili')) langDisplay += ' (Bilibili)';

                    option.textContent = langDisplay;
                    option.dataset.value = index;

                    option.addEventListener('click', function () {
                        // Update UI
                        document.querySelectorAll('.custom-option').forEach(el => el.classList.remove('selected'));
                        this.classList.add('selected');
                        selectTriggerSpan.textContent = this.textContent;
                        selectWrapper.classList.remove('open');

                        // Update State
                        selectedIndex = index;
                    });

                    optionsContainer.appendChild(option);
                });

                // Initialize Trigger Text
                if (optionsContainer.children.length > 0) {
                    selectTriggerSpan.textContent = optionsContainer.children[0].textContent;
                }

                // Toggle Dropdown
                selectTrigger.addEventListener('click', () => {
                    selectWrapper.classList.toggle('open');
                });

                // Close dropdown when clicking outside
                document.addEventListener('click', (e) => {
                    if (!selectWrapper.contains(e.target)) {
                        selectWrapper.classList.remove('open');
                    }
                });

                // Download Action
                downloadBtn.onclick = () => {
                    downloadSubtitle(subtitles[selectedIndex], selectedIndex);
                };

                // Summary UI Elements
                const summaryArea = document.getElementById('summary-area');
                const summaryStatus = document.getElementById('summary-status');
                const summaryResult = document.getElementById('summary-result');
                const summaryText = document.getElementById('summary-text');
                const summaryError = document.getElementById('summary-error');

                const statusStep1 = document.getElementById('status-step-1');
                const statusStep2 = document.getElementById('status-step-2');
                const statusStep3 = document.getElementById('status-step-3');

                // Helper to update step status
                function updateStep(stepEl, status, text) {
                    const icon = stepEl.querySelector('.step-icon');
                    const span = stepEl.querySelector('span:last-child');
                    if (text) span.textContent = text;

                    if (status === 'active') {
                        stepEl.style.color = '#007aff';
                        icon.textContent = '◉';
                    } else if (status === 'done') {
                        stepEl.style.color = '#2e7d32';
                        icon.textContent = '✓';
                    } else if (status === 'error') {
                        stepEl.style.color = '#c62828';
                        icon.textContent = '✗';
                    } else {
                        stepEl.style.color = '#ccc';
                        icon.textContent = '○';
                    }
                }

                // Reset all steps
                function resetSteps() {
                    updateStep(statusStep1, 'pending', '发送请求中...');
                    updateStep(statusStep2, 'pending', '等待响应...');
                    updateStep(statusStep3, 'pending', '输出内容...');
                }



                // Summarize Action - 使用流式输出
                summarizeBtn.onclick = () => {
                    const sub = subtitles[selectedIndex];
                    // 使用新的多 provider 存储格式
                    chrome.storage.local.get(['aiProviders', 'activeProviderId', 'aiConfig'], (res) => {
                        let activeConfig = null;

                        // 优先使用新格式
                        if (res.aiProviders && res.activeProviderId) {
                            activeConfig = res.aiProviders.find(p => p.id === res.activeProviderId);
                        }
                        // 兼容旧格式
                        if (!activeConfig && res.aiConfig && res.aiConfig.key) {
                            activeConfig = res.aiConfig;
                        }

                        if (!activeConfig || !activeConfig.key) {
                            // Open settings if not configured
                            if (chrome.runtime.openOptionsPage) {
                                chrome.runtime.openOptionsPage();
                            } else {
                                window.open(chrome.runtime.getURL('options/options.html'));
                            }
                            return;
                        }

                        // Show status area
                        summaryArea.style.display = 'block';
                        summaryStatus.style.display = 'block';
                        summaryResult.style.display = 'none';
                        summaryError.style.display = 'none';
                        resetSteps();

                        // Step 1: Sending request
                        updateStep(statusStep1, 'active', '发送请求中...');

                        // Extract plain text from subtitle data
                        const plainText = extractSubtitleText(sub.data, sub.url);

                        // 使用流式连接
                        const port = chrome.runtime.connect({ name: 'summarize-stream' });
                        let streamedContent = '';
                        let hasScrolledToBottom = false; // 标记是否已触发过外层滚动
                        // 用户希望默认不自动滚动，因为是从上往下读

                        port.onMessage.addListener((msg) => {
                            if (msg.type === 'chunk') {
                                // 首次收到内容时，切换到输出状态
                                if (streamedContent === '') {
                                    updateStep(statusStep1, 'done', '请求已发送');
                                    updateStep(statusStep2, 'done', '收到响应');
                                    updateStep(statusStep3, 'active', '输出中...');

                                    // 显示结果区域
                                    summaryStatus.style.display = 'none';
                                    summaryText.innerHTML = ''; // Clear text
                                    summaryResult.style.display = 'block';
                                    summaryText.scrollTop = 0; // 总结框内部顶部对齐

                                }

                                streamedContent += msg.content;
                                summaryText.innerHTML = markdownToHtml(streamedContent);

                                // 当总结框高度达到最大值(450px)时，外层滚动条自动拉到底部
                                if (!hasScrolledToBottom && summaryText.scrollHeight >= 450) {
                                    hasScrolledToBottom = true;
                                    setTimeout(() => {
                                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                                    }, 50);
                                }


                            } else if (msg.type === 'done') {
                                updateStep(statusStep3, 'done', '输出完成');

                                // Update header to show summary success
                                statusHeader.innerHTML = `
                                    <div class="status-success">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                        总结成功
                                    </div>
                                `;

                                port.disconnect();
                            } else if (msg.type === 'error') {
                                updateStep(statusStep1, 'done', '请求已发送');
                                updateStep(statusStep2, 'error', '请求失败');

                                summaryError.textContent = `错误: ${msg.error}`;
                                summaryError.style.display = 'block';

                                port.disconnect();
                            }
                        });

                        // 发送开始请求
                        port.postMessage({
                            action: 'start',
                            subtitle: plainText,
                            lang: sub.lang,
                            title: sub.title,
                            config: activeConfig
                        });
                    });
                };
            } else {
                statusHeader.textContent = "暂未检测到字幕...";
                statusHeader.className = "status-header status-waiting";
                mainInterface.style.display = 'none';
            }
        });
    });
});

function downloadSubtitle(sub, index) {
    let content = sub.data;
    let ext = 'txt';
    let mime = 'text/plain';

    // 简单的格式检测
    if (sub.url.includes('api/timedtext')) {
        ext = 'xml'; // YouTube 通常是 XML
        if (content.startsWith('{')) {
            ext = 'json'; // 或者是 JSON
            mime = 'application/json';
        } else {
            mime = 'text/xml';
        }
    } else if (sub.url.includes('aisubtitle.hdslb.com')) {
        ext = 'json'; // Bilibili 通常是 JSON
        mime = 'application/json';
    } else {
        // Default check
        if (content.startsWith('{')) {
            ext = 'json';
            mime = 'application/json';
        }
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    // Clean filename
    const safeTitle = (sub.title || 'subtitle').replace(/[<>:"/\\|?*]+/g, '_').trim();
    const langSuffix = sub.lang ? `_${sub.lang}` : `_${index + 1}`;
    a.download = `${safeTitle}${langSuffix}.${ext}`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}


// extractSubtitleText 和 markdownToHtml 函数已移至 utils.js 公共模块
