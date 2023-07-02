const { spawn } = require('child_process');
const fs = require('fs');
const { app } = require('electron')
const path = require('path');
const appRootDir = require('app-root-dir');

let naiveProcess = null;
module.exports = {

    closeNaive() {
        if (naiveProcess) {
            naiveProcess.kill('SIGINT');
            naiveProcess = null;
        }
    },

    handleExit() {
        module.exports.closeNaive();
        app.quit()
    },

    runNaive() {
        let config = global.global_config
        // const commandPath = path.join('/Users/accidia/Downloads/naiveproxy-v114.0.5735.91-3-mac-arm64/naive')
        // 替换为您的二进制程序路径和参数
        naiveProcess = spawn(config.filePath, [`--listen=socks://${config.addr}:${config.port}`, `--proxy=https://${config.username}:${config.password}@${config.proxy}`]);
        naiveProcess.on('exit', (code, signal) => {
            naiveProcess = null;
        });
        naiveProcess.on('error', (err) => {
            console.error('Command process error:', err);
            naiveProcess = null;
        });
    },

    getConfig() {
        // 读取配置文件
        const configPath = path.join(app.getPath('userData'), 'config.json');
        if (fs.existsSync(configPath)) {
            const configData = fs.readFileSync(configPath, 'utf8');
            global.global_config = JSON.parse(configData);
            return global.global_config
        }
        return {
            status: false,
            addr: '127.0.0.1',
            port: 1080,
            proxy: '',
            username: '',
            password: '',
            filePath: ''
        };
    },

    async updateConfig(_event, config) {
        // 没启动naive时就启动navie
        if (!naiveProcess && config.status) {
            module.exports.runNaive();
        }
        // 启动navie时才关闭navie
        if (naiveProcess && !config.status) {
            module.exports.closeNaive();
        }
        // 启动navie时，但是更新了内容时，重启naive
        if (naiveProcess && config.status) {
            module.exports.closeNaive();
            global.global_config = config
            // 延迟500毫秒，防止下面的方法没有成功启动
            await module.exports.sleep(500);
            module.exports.runNaive();
        }
        global.global_config = config
        const filePath = path.join(app.getPath('userData'), 'config.json');
        const jsonContent = JSON.stringify(config);
        fs.writeFileSync(filePath, jsonContent, 'utf-8');
    },
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
}