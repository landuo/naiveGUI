/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */
window.addEventListener('DOMContentLoaded', async () => {
    const config = await window.api.getConfig();
    // 获取页面上的元素
    const status = document.getElementById('status');
    const addr = document.getElementById('addr');
    const filePath = document.getElementById('filePath');
    const port = document.getElementById('port');
    const proxy = document.getElementById('proxy');
    const username = document.getElementById('username');
    const password = document.getElementById('password');
    const saveButton = document.getElementById('saveButton');

    // 更新页面上的元素值
    status.checked = config.status;
    filePath.value = config.filePath;
    addr.value = config.addr;
    port.value = config.port;
    proxy.value = config.proxy;
    username.value = config.username;
    password.value = config.password;

    status.addEventListener('change', () => {
        saveConfig()
    });

    // 监听保存按钮点击事件
    saveButton.addEventListener('click', () => {
        saveConfig()
    });
    function saveConfig() {
        // 获取输入框的值
        const config = {
            status: status.checked,
            addr: addr.value,
            port: port.value,
            proxy: proxy.value,
            username: username.value,
            password: password.value,
            filePath: filePath.value
        };

        // 发送配置数据给主进程
        window.api.updateConfig(config);
    };
    window.api.onTrayCheckboxChange((_event, value) => {
        status.checked = value;
    });
});