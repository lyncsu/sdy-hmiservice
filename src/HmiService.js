import ProjectService from './service/ProjectService';
import EventDispatcher from './event/EventDispatcher';
import { clone, isAvaliable } from './utils/Util';
import Global from './event/Global';
import { MqttService } from './service/MqttService';
/**
 * Hmi服务
 */
class HmiService extends EventDispatcher {
    /**
     * 初始化完成
     */
    _initialized;
    /**
     * 通讯服务
     */
    mqttService;
    /**
     * 构造函数
     */
    constructor() {
        super();

        this._initialized = false;

        window.project = ProjectService;
    }
    /**
     * 初始化
     * @param {*} params
     * @returns
     */
    init(
        params = {
            debug: true,
        },
    ) {
        return new Promise((resolve, reject) => {
            if (!isAvaliable(params?.gateway)) return reject('大网关项目配置必填');
            else ProjectService.projectData.server.gateway = params?.gateway;
            if (isAvaliable(params?.debug)) Global.debug = params?.debug;

            this._initialized = true;

            this.mqttService = new MqttService();
            this.mqttService.init();
            resolve();
        });
    }
    /**
     * 权限
     * @description    let authObj = {
        "dxt": 2,  //大系统 1=中心|2=车站|3=IBP
        "xxt": 2,  //小系统
        "sdt": 2,  //隧道通风
        "zmxt": 2, //照明系统
        "jpsxt": 2, // 给排水
        "ktsxt": 2  // 空调水系统
        }
        window.isCenter ：Boolean //  true 表示当前登录角色是中央 false 表示是车站角色
        window.currentSys : keyof authObj // HMI当前页面展示哪个系统 值为 dxt、xxt、...
     */
    setPermission(authObj) {
        if (!isAvaliable(authObj)) return;
        this.authService.permission = clone(authObj);
    }
}

export default new HmiService();
