import * as mqtt from 'MQTT-browser';
import Log from '../utils/Log';
import { checkTypeByTopic } from '../utils/ServiceUtil';
import { getUInt32ID, isAvaliable } from '../utils/Util';
import { Event } from '../event/Event';
import EventDispatcher from '../event/EventDispatcher';
/**
 * 通信服务
 */
export class MqttService extends EventDispatcher {
    /**
     * 项目数据引用
     */
    projectService;
    /**
     * 大网关客户端
     */
    client;
    /**
     * 服务连接状态
     */
    isConnected = false;
    /**
     * 已订阅集合
     */
    subscriptions;
    /**
     * 下发控制订阅集合
     */
    downSubscriptions;
    /**
     * 通信服务构造函数
     */
    constructor(projectService) {
        super();

        this.projectService = projectService;

        this.bindScope();
        this.init();
    }
    /**
     * 订阅设备
     * @param {*} productKey
     * @param {*} deviceSN
     * @returns
     */
    subscribeDevice(productKey, deviceSN, needsDownReply = false) {
        return new Promise((resolve, reject) => {
            if (!isAvaliable(productKey)) return reject('请传入正确的productKey');
            if (!isAvaliable(deviceSN)) return reject('请传入正确的deviceSN');
            if (!this.isConnected) return reject('mqtt服务未连接');

            const target = `${productKey}/${deviceSN}`;
            const upTopic = `v1/${target}/sys/property/up`;
            const downReplyTopic = `v1/${target}/sys/property/down_reply`;
            if (!this.client?._resubscribeTopics[upTopic])
                if (this.client)
                    this.client.subscribe(upTopic, { qos: 1 }, err => {
                        if (err) {
                            Log.error(`设备服务订阅失败${target}/up`, err);
                            return reject(err);
                        }
                        if (!isAvaliable(this.subscriptions)) this.subscriptions = [];
                        if (this.subscriptions.findIndex(item => item === target) === -1)
                            this.subscriptions.push(target);
                        Log.info(`设备服务订阅成功${target}`);
                    });
            // 如无需下发
            if (!needsDownReply) return resolve(`设备服务订阅成功${target}`);

            // 可写点位需要侦听下发回复down_reply
            if (!this.client?._resubscribeTopics[downReplyTopic])
                if (this.client)
                    this.client.subscribe(`v1/${target}/sys/property/down_reply`, { qos: 1 }, (err, res) => {
                        if (err) {
                            Log.error(`设备下发回复订阅失败 v1/${target}/sys/property/down_reply`, err);
                            return;
                        }
                        if (!isAvaliable(this.downSubscriptions)) this.downSubscriptions = [];
                        if (this.downSubscriptions.findIndex(item => item === target) === -1)
                            this.downSubscriptions.push(target);
                        Log.info(`设备下发回复订阅成功 v1/${target}/sys/property/down_reply`);
                    });

            resolve(`设备服务及下发回复订阅成功${target}`);
        });
    }
    /**
     * 取消设备订阅
     * @param {*} productKey
     * @param {*} deviceSN
     * @returns
     */
    unsubscribeDevice(productKey, deviceSN) {
        return new Promise((resolve, reject) => {
            if (!this.isConnected) return reject('mqtt服务未连接');
            // 都未传入, 则全部取消
            if (!isAvaliable(productKey) && !isAvaliable(deviceSN)) {
                if (isAvaliable(this.subscriptions))
                    while (this.subscriptions.length) {
                        const item = this.subscriptions.pop();
                        if (this.client)
                            this.client.unsubscribe(`v1/${item}/sys/property/up`, err => {
                                if (err) {
                                    Log.error('取消订阅失败', err);
                                    return;
                                }
                                Log.info(`取消订阅成功${item}/up`, item);
                            });
                    }
                // 下发订阅
                if (isAvaliable(this.downSubscriptions))
                    while (this.downSubscriptions.length) {
                        const item = this.downSubscriptions.pop();
                        if (this.client)
                            this.client.unsubscribe(`v1/${item}/sys/property/down_reply`, err => {
                                if (err) {
                                    Log.error('取消订阅失败', err);
                                    return;
                                }
                                Log.info(`取消订阅成功${item}/down_reply`, item);
                            });
                    }
                return resolve();
            }
            // 有传入则检查是否漏填
            if (!isAvaliable(productKey)) return reject('请传入正确的productKey');
            if (!isAvaliable(deviceSN)) return reject('请传入正确的deviceSN');

            if (isAvaliable(this.subscriptions)) {
                const index = this.subscriptions.findIndex(sub => sub === `${productKey}/${deviceSN}`);
                if (index !== -1) {
                    const item = this.subscriptions.splice(index, 1);
                    if (this.client)
                        this.client.unsubscribe(`v1/${item}/sys/property/up`, err => {
                            if (err) {
                                Log.error('取消订阅失败', err);
                                return reject(err);
                            }
                            Log.info(`取消订阅成功${item}/up`, item);
                        });
                }
                // 下发订阅
                if (isAvaliable(this.downSubscriptions)) {
                    const downIndex = this.downSubscriptions.findIndex(sub => sub === `${productKey}/${deviceSN}`);
                    if (downIndex !== -1) {
                        const downItem = this.downSubscriptions.splice(downIndex, 1);
                        if (this.client)
                            this.client.unsubscribe(`v1/${downItem}/sys/property/down_reply`, err => {
                                if (err) {
                                    Log.error('取消订阅失败', err);
                                    return;
                                }
                                Log.info(`取消订阅成功${downItem}/down_reply`, downItem);
                            });
                    }
                }
            }
            return resolve();
        });
    }
    /**
     * 下发控制
     * @param {*} productKey
     * @param {*} deviceSN
     * @param {*} data
     * @returns
     */
    controlDevice(productKey, deviceSN, params) {
        return new Promise((resolve, reject) => {
            if (!isAvaliable(productKey)) return reject('请传入正确的productKey');
            if (!isAvaliable(deviceSN)) return reject('请传入正确的deviceSN');
            if (!this.isConnected) return reject('mqtt服务未连接');

            const message = JSON.stringify({ msgid: getUInt32ID(), params });
            const target = `${productKey}/${deviceSN}`;
            if (this.client)
                this.client.publish(`v1/${target}/sys/property/down`, message, { qos: 1 }, (err, res) => {
                    if (err) {
                        Log.error(`设备下发失败 v1/${target}/sys/property/down`, err);
                        return reject('设备下发失败');
                    }
                    Log.info(`设备下发 → v1/${target}/sys/property/down`, JSON.stringify(res));

                    const callback = e => {
                        const res = JSON.parse(e.data.message);
                        if (res.code === 0) resolve(res);
                        else reject(res.data);
                        this.off(Event.MQTT_DOWN_REPLY, callback);
                    };
                    this.on(Event.MQTT_DOWN_REPLY, callback);
                });
        });
    }
    /**
     * 初始化
     */
    init() {
        this.initMqttClinet();
    }
    /**
     * 初始化客户端
     */
    initMqttClinet() {
        if (!isAvaliable(this.projectService.projectData?.server.gateway)) return;

        const { port, username, password } = this.projectService.projectData.server.gateway;
        // 网关监听设备服务
        const { host } = this.projectService.projectData.server.gateway;
        const client = mqtt.connect(`ws://${host}:${port}/mqtt`, {
            username: username,
            password: password,
        });
        this.listen(client);
        this.client = client;
    }
    /**
     *
     * @param client
     * @returns
     */
    listen(client) {
        if (!client) return;
        client.stream.on('error', e => {
            Log.error('MQTT连接失败');
        });
        client.on('connect', this.onClientConnect);
        client.on('disconnect', this.onClientDisconnect);
        client.on('close', this.onClientClose);
        client.on('offline', this.onClientOffline);
        client.on('error', this.onClientError);
        client.on('reconnect', this.onClientReconnect);
        client.on('message', this.onMessage);
        client.on('packetsend', this.onClientSend);
        client.on('packetreceive', this.onClientReceive);
    }
    /**
     * 释放
     */
    dispose() {
        this.disposeClient(this.client);
        this.client = null;
        this.subscriptions = null;
        this.downSubscriptions = null;

        super.dispose();
    }
    /**
     * 连接成功
     */
    onClientConnect(e) {
        Log.info('MQTT已连接');
        this.isConnected = true;
    }
    /**
     * 重新连接
     */
    onClientReconnect(e) {
        Log.info('MQTT尝试重连', JSON.stringify(e));
    }
    /**
     * 服务端发包断开
     */
    onClientDisconnect(e) {
        Log.error('MQTT服务端通知断开', JSON.stringify(e));
        this.isConnected = false;
    }
    /**
     * 断开连接
     */
    onClientClose() {
        Log.error('MQTT本地断开');
        this.isConnected = false;
    }
    /**
     * 离线
     */
    onClientOffline() {
        Log.error('MQTT离线');
        this.isConnected = false;
    }
    /**
     * 报错异常
     */
    onClientError(err) {
        Log.error('MQTT异常', JSON.stringify(err));
        this.isConnected = false;
    }
    /**
     * 消息接受
     * @param topic
     * @param message
     */
    onMessage(topic, message) {
        Log.info('MQTT消息', `${topic} ${message.toString()}`);

        const type = checkTypeByTopic(topic);
        switch (type) {
            case MqttMessageType.DEVICE:
                this.emit(Event.MQTT_DEVICE_MESSAGE, { topic, message });

                break;
            case MqttMessageType.DOWN_REPLY:
                this.emit(Event.MQTT_DOWN_REPLY, { topic, message });

                break;
        }
    }
    /**
     * 离线
     */
    onClientSend(packet) {
        Log.info('MQTT发送 →', JSON.stringify(packet));
    }
    /**
     * 离线
     */
    onClientReceive(packet) {
        Log.info(`MQTT接收 ←`, JSON.stringify(packet));
    }
    /**
     * 绑定作用域
     */
    bindScope() {
        this.onMessage = this.onMessage.bind(this);
        this.onClientConnect = this.onClientConnect.bind(this);
        this.onClientReconnect = this.onClientReconnect.bind(this);
        this.onClientDisconnect = this.onClientDisconnect.bind(this);
        this.onClientClose = this.onClientClose.bind(this);
        this.onClientOffline = this.onClientOffline.bind(this);
        this.onClientError = this.onClientError.bind(this);
        this.onClientSend = this.onClientSend.bind(this);
        this.onClientReceive = this.onClientReceive.bind(this);
    }
}
/**
 * 消息类型枚举
 */
export class MqttMessageType {
    // 设备
    static DEVICE = 'mqtt_message_type_device';
    // 控制回复
    static DOWN_REPLY = 'mqtt_message_type_down_reply';
    // 报警
    static ALARM = 'mqtt_message_type_alarm';
    // 模式执行
    static MODE_EXECUTE = 'mqtt_message_type_mode_execute';
    // 模型退出
    static MODE_EXIT = 'mqtt_message_type_mode_exit';
    // 在线离线
    static ONLINE = 'mqtt_message_type_online';
    // 未知类型
    static UNKNOWN = 'mqtt_message_type_unknown';
}
