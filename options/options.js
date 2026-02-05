document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const navItems = document.querySelectorAll('.nav-item');
    const pageSettings = document.getElementById('page-settings');
    const pageAbout = document.getElementById('page-about');
    const pageGeneral = document.getElementById('page-general');
    const readmeContent = document.getElementById('readme-content');

    // General elements
    const optionsDebugMode = document.getElementById('options-debug-mode');

    // Provider elements
    const providerListContainer = document.getElementById('provider-list-container');
    const addProviderBtn = document.getElementById('add-provider-btn');
    const configPanel = document.getElementById('config-panel');
    const emptyState = document.getElementById('empty-state');
    const configForm = document.getElementById('config-form');
    const configTitle = document.getElementById('config-title');

    // Form elements - 基础配置
    const providerNameInput = document.getElementById('provider-name');
    const apiUrlInput = document.getElementById('api-url');
    const apiKeyInput = document.getElementById('api-key');
    const apiModelInput = document.getElementById('api-model');
    const showKeyCheckbox = document.getElementById('show-key');
    const saveBtn = document.getElementById('save-btn');
    const testBtn = document.getElementById('test-connection-btn');
    const statusMsg = document.getElementById('status-msg');

    // Form elements - Prompt 设置
    const systemPromptInput = document.getElementById('system-prompt');
    const customPromptInput = document.getElementById('custom-prompt');

    // Form elements - 高级参数
    const maxTokensInput = document.getElementById('max-tokens');
    const maxTokensValue = document.getElementById('max-tokens-value');
    const temperatureInput = document.getElementById('temperature');
    const temperatureValue = document.getElementById('temperature-value');

    // Collapsible panels
    const collapsibles = document.querySelectorAll('.collapsible');

    // State
    let providers = []; // Array of provider configs
    let activeProviderId = null; // Currently active (selected for use)
    let editingProviderId = null; // Currently editing

    // 初始化折叠面板
    collapsibles.forEach(panel => {
        const header = panel.querySelector('.collapsible-header');
        header.addEventListener('click', () => {
            panel.classList.toggle('open');
        });
    });

    // 初始化 range 滑块实时更新
    maxTokensInput.addEventListener('input', () => {
        maxTokensValue.textContent = maxTokensInput.value;
    });
    temperatureInput.addEventListener('input', () => {
        temperatureValue.textContent = temperatureInput.value;
    });

    // Debug Mode Logic
    if (optionsDebugMode) {
        chrome.storage.local.get(['debugMode'], (result) => {
            optionsDebugMode.checked = result.debugMode || false;
        });

        optionsDebugMode.addEventListener('change', () => {
            chrome.storage.local.set({ debugMode: optionsDebugMode.checked });
        });
    }

    // Load providers from storage
    function loadProviders() {
        chrome.storage.local.get(['aiProviders', 'activeProviderId'], (result) => {
            providers = result.aiProviders || [];
            activeProviderId = result.activeProviderId || null;

            // 兼容旧版本：迁移 aiConfig 数据
            if (providers.length === 0) {
                chrome.storage.local.get(['aiConfig'], (oldResult) => {
                    if (oldResult.aiConfig && oldResult.aiConfig.key) {
                        const migrated = {
                            id: generateId(),
                            name: '默认配置',
                            url: oldResult.aiConfig.url || '',
                            key: oldResult.aiConfig.key || '',
                            model: oldResult.aiConfig.model || '',
                            prompt: oldResult.aiConfig.prompt || '',
                            systemPrompt: '',
                            maxTokens: 4000,
                            temperature: 0.7
                        };
                        providers = [migrated];
                        activeProviderId = migrated.id;
                        saveProviders();
                    }
                    renderProviderList();
                });
            } else {
                renderProviderList();
            }
        });
    }

    // Save providers to storage
    function saveProviders() {
        chrome.storage.local.set({
            aiProviders: providers,
            activeProviderId: activeProviderId
        });
    }

    // Generate unique ID
    function generateId() {
        return 'provider_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Render provider list
    function renderProviderList() {
        providerListContainer.innerHTML = '';

        if (providers.length === 0) {
            emptyState.style.display = 'block';
            configForm.style.display = 'none';
            return;
        }

        providers.forEach(provider => {
            const item = document.createElement('div');
            item.className = 'provider-item' + (editingProviderId === provider.id ? ' selected' : '');
            item.innerHTML = `
                <div class="provider-radio ${activeProviderId === provider.id ? 'active' : ''}" data-id="${provider.id}"></div>
                <span class="provider-name">${provider.name || '未命名'}</span>
                <span class="provider-delete" data-id="${provider.id}" title="删除">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </span>
            `;

            // Click to edit
            item.addEventListener('click', (e) => {
                if (e.target.closest('.provider-delete') || e.target.closest('.provider-radio')) return;
                editProvider(provider.id);
            });

            // Radio click to activate
            item.querySelector('.provider-radio').addEventListener('click', (e) => {
                e.stopPropagation();
                activateProvider(provider.id);
            });

            // Delete
            item.querySelector('.provider-delete').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteProvider(provider.id);
            });

            providerListContainer.appendChild(item);
        });

        // Auto-select first if none editing
        if (!editingProviderId && providers.length > 0) {
            editProvider(providers[0].id);
        }
    }

    // Add new provider
    addProviderBtn.addEventListener('click', () => {
        const newProvider = {
            id: generateId(),
            name: '新配置 ' + (providers.length + 1),
            url: '',
            key: '',
            model: '',
            prompt: '',
            systemPrompt: '',
            maxTokens: 4000,
            temperature: 0.7
        };
        providers.push(newProvider);

        // Auto-activate if first
        if (providers.length === 1) {
            activeProviderId = newProvider.id;
        }

        saveProviders();
        editProvider(newProvider.id);
        renderProviderList();
    });

    // Edit provider
    function editProvider(id) {
        editingProviderId = id;
        const provider = providers.find(p => p.id === id);
        if (!provider) return;

        emptyState.style.display = 'none';
        configForm.style.display = 'block';
        configTitle.textContent = provider.name || '编辑配置';

        // 基础配置
        providerNameInput.value = provider.name || '';
        apiUrlInput.value = provider.url || '';
        apiKeyInput.value = provider.key || '';
        apiModelInput.value = provider.model || '';

        // Prompt 设置
        systemPromptInput.value = provider.systemPrompt || '';
        customPromptInput.value = provider.prompt || '';

        // 高级参数
        const maxTokens = provider.maxTokens || 4000;
        const temperature = provider.temperature !== undefined ? provider.temperature : 0.7;
        maxTokensInput.value = maxTokens;
        maxTokensValue.textContent = maxTokens;
        temperatureInput.value = temperature;
        temperatureValue.textContent = temperature;

        renderProviderList();
    }

    // Activate provider (set as current)
    function activateProvider(id) {
        activeProviderId = id;
        saveProviders();
        renderProviderList();
        showStatus('已切换到该配置', 'success');
    }

    // Delete provider
    function deleteProvider(id) {
        if (!confirm('确定要删除这个配置吗？')) return;

        providers = providers.filter(p => p.id !== id);

        if (activeProviderId === id) {
            activeProviderId = providers.length > 0 ? providers[0].id : null;
        }

        if (editingProviderId === id) {
            editingProviderId = providers.length > 0 ? providers[0].id : null;
        }

        saveProviders();
        renderProviderList();

        if (providers.length === 0) {
            emptyState.style.display = 'block';
            configForm.style.display = 'none';
        } else if (editingProviderId) {
            editProvider(editingProviderId);
        }
    }

    // Save current editing provider
    saveBtn.addEventListener('click', () => {
        if (!editingProviderId) return;

        const provider = providers.find(p => p.id === editingProviderId);
        if (!provider) return;

        // 基础配置
        provider.name = providerNameInput.value.trim() || '未命名';
        provider.url = apiUrlInput.value.trim();
        provider.key = apiKeyInput.value.trim();
        provider.model = apiModelInput.value.trim();

        // Prompt 设置
        provider.systemPrompt = systemPromptInput.value.trim();
        provider.prompt = customPromptInput.value.trim();

        // 高级参数
        provider.maxTokens = parseInt(maxTokensInput.value) || 4000;
        provider.temperature = parseFloat(temperatureInput.value) || 0.7;

        configTitle.textContent = provider.name;
        saveProviders();
        renderProviderList();
        showStatus('配置已保存', 'success');
    });

    // Toggle password visibility
    showKeyCheckbox.addEventListener('change', () => {
        apiKeyInput.type = showKeyCheckbox.checked ? 'text' : 'password';
    });

    // Test connection
    testBtn.addEventListener('click', () => {
        const url = apiUrlInput.value.trim();
        const key = apiKeyInput.value.trim();
        const model = apiModelInput.value.trim();

        if (!url || !key) {
            showStatus('请先填写 API 地址和密钥', 'error');
            return;
        }

        statusMsg.style.display = 'none';
        testBtn.textContent = '测试中...';
        testBtn.style.opacity = '0.7';

        chrome.runtime.sendMessage({
            action: 'testConnection',
            config: { url, key, model }
        }, (response) => {
            testBtn.textContent = '连接测试';
            testBtn.style.opacity = '1';

            if (chrome.runtime.lastError) {
                showStatus(`通信错误: ${chrome.runtime.lastError.message}`, 'error');
                return;
            }

            if (response && response.success) {
                const latency = response.latency || 0;
                let msg = `连接成功！延迟: ${latency}ms`;

                // Check if AI actually replied something
                if (response.aiConnectionContent && response.aiConnectionContent.trim().length > 0) {
                    if (response.aiConnectionContent.startsWith('RAW:')) {
                        // 解析失败，显示原始数据片段
                        msg += ` (格式异常: ${response.aiConnectionContent.substring(5, 1000)}...)`;
                    } else {
                        // msg += ' (AI回复正常)'; // 正常时不显示
                    }
                } else {
                    msg += ' (AI无回复内容)';
                }

                showStatus(msg, 'success');
            } else {
                let errorDetails = (response && (response.data || response.error)) || 'Unknown Error';
                try {
                    const json = JSON.parse(errorDetails);
                    errorDetails = JSON.stringify(json, null, 2);
                } catch (e) { }
                if (errorDetails.length > 300) errorDetails = errorDetails.substring(0, 300) + '...';
                showStatus(`连接失败: ${errorDetails}`, 'error');
            }
        });
    });

    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            const page = item.dataset.page;
            pageSettings.style.display = page === 'settings' ? 'flex' : 'none';
            pageAbout.style.display = page === 'about' ? 'block' : 'none';
            if (pageGeneral) pageGeneral.style.display = page === 'general' ? 'block' : 'none';

            if (page === 'about') loadReadme();
        });
    });

    // Load README
    async function loadReadme() {
        if (readmeContent.dataset.loaded) return;
        try {
            const response = await fetch(chrome.runtime.getURL('README_CN.md'));
            const text = await response.text();
            readmeContent.innerHTML = markdownToHtml(text);
            readmeContent.dataset.loaded = 'true';
        } catch (e) {
            readmeContent.innerHTML = '<p style="color: #999;">无法加载 README 文件</p>';
        }
    }

    // markdownToHtml 函数已移至 utils.js 公共模块

    function showStatus(text, type) {
        statusMsg.textContent = text;
        statusMsg.className = 'status-msg ' + (type === 'success' ? 'status-success' : 'status-error');
        statusMsg.style.display = 'block';

        if (type === 'success') {
            // setTimeout(() => statusMsg.style.display = 'none', 3000);
        }
    }

    // Initialize
    loadProviders();
});
