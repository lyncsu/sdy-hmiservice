import { Event } from './event/Event';
import EventDispatcher from './event/EventDispatcher';
import Global from './event/Global';
import ApiService from './service/ApiService';
import AuthService from './service/AuthService';
import { MqttService } from './service/MqttService';
import ProjectService from './service/ProjectService';
import Log from './utils/Log';
import { isAvaliable } from './utils/Util';
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
     * 项目服务
     */
    projectService;
    /**
     * 权限服务
     */
    authService;
    /**
     * 构造函数
     */
    constructor() {
        super();

        this._initialized = false;

        this.projectService = new ProjectService();
        this.authService = new AuthService();

        window.projectService = this.projectService;

        this.bindScope();
    }
    /**
     * 初始化
     * @param {*} params
     * @returns
     */
    init(params) {
        return new Promise((resolve, reject) => {
            if (!isAvaliable(params?.gateway)) return reject('大网关项目配置必填');
            else this.projectService.projectData.server.gateway = params?.gateway;
            if (!isAvaliable(params?.hci)) return reject('超融合项目配置必填');
            else this.projectService.projectData.server.hci = params?.hci;
            // 调试模式
            Global.debug = Boolean(params?.debug);
            console.info('debug', Global.debug);
            // 日志
            Log.level = Global.debug ? 4 : 0;

            this.mqttService = new MqttService(this.projectService);
            this.mqttService.on(Event.MQTT_DEVICE_MESSAGE, this.onMqttMessage);
            this.mqttService.on(Event.MQTT_PACKETSEND, this.onMqttMessage);
            this.mqttService.on(Event.MQTT_PACKETRECEIVE, this.onMqttMessage);

            this._initialized = true;

            ApiService.init(this.projectService);

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
        this.authService.setPermission(authObj);
    }
    /**
     * 按deviceSn获取设备影子
     * @param deviceSns
     * @returns
     */
    loadDeviceShadowByDeviceSn(params) {
        return ApiService.loadDeviceShadowByDeviceSn(params);
    }
    /**
     * 订阅设备
     * @param {string} productKey 设备类别
     * @param {string} deviceSN 设备sn码
     * @param {boolean} needsDownReply 是否需要订阅控制下发消息
     */
    subscribeDevice(productKey, deviceSN, needsDownReply = false) {
        if (!this._initialized) return Promise.reject('请检查初始化配置');

        return this.mqttService.subscribeDevice(productKey, deviceSN, needsDownReply);
    }
    /**
     * 取消设备订阅
     * @param {*} productKey 设备类别
     * @param {*} deviceSN 设备sn码
     */
    unsubscribeDevice(productKey, deviceSN) {
        if (!this._initialized) return Promise.reject('请检查初始化配置');

        return this.mqttService.unsubscribeDevice(productKey, deviceSN);
    }
    /**
     * 控制设备
     * @param {*} productKey 设备类别
     * @param {*} deviceSN 设备sn码
     * @param {*} param 参数
     */
    controlDevice(productKey, deviceSN, param) {
        if (!this._initialized) return Promise.reject('请检查初始化配置');

        return this.mqttService.controlDevice(productKey, deviceSN, param);
    }
    /**
     * 侦听消息
     */
    onMqttMessage(e) {
        this.emit(e.type, e.data);
    }
    /**
     * 绑定作用域
     */
    bindScope() {
        this.onMqttMessage = this.onMqttMessage.bind(this);
        // this.init = this.init.bind(this);
        // this.subscribeDevice = this.subscribeDevice.bind(this);
    }
}

export default new HmiService();
