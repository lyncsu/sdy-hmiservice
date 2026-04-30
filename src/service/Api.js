import { getServerTitle, isValidIPv4, isValidPort } from '../utils/ServiceUtil';
import { isAvaliable } from '../utils/Util';

class Api {
    server;
    /**
     * 获取接口地址
     * @param type
     * @returns
     */
    get(type) {
        if (!this.server) return;
        switch (type) {
            case 'deviceShadow/list':
                return `http://${this.server.hci.host}:${this.server.hci.port}/hci-alarm-base/v1/deviceShadow/list`;
        }
        return;
    }
    /**
     * 注册接口配置url
     * @param serverConfig
     */
    register(serverConfig) {
        // 检查各项配置
        if (!isAvaliable(serverConfig)) return { code: -1, msg: '请检查配置是否存在' };
        const entries = Object.entries(serverConfig);
        for (let i = 0; i < entries.length; i++) {
            const [key, value] = entries[i];
            if (!isAvaliable(value.host) || !isValidIPv4(value.host))
                return { code: -1, msg: ` 请检查${getServerTitle(key)}地址配置` };

            if (!isAvaliable(value.port) || !isValidPort(value.port))
                return { code: -1, msg: ` 请检查${getServerTitle(key)}端口配置` };

            if (value.type === 'mqtt') {
                if (!isAvaliable(value.username) || !isAvaliable(value.password))
                    return { code: -1, msg: ` 请检查${getServerTitle(key)}用户名密码配置` };
            }
            // 检查正确的注册到server
            if (!this.server) this.server = {};
            this.server[key] = value;
        }
        return { code: 0 };
    }
}

export default new Api();
