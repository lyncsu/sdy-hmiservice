import * as mqtt from 'MQTT-browser';
import ProjectService from './ProjectService';
import { isAvaliable } from '../utils/Util';
import Log from '../utils/Log';
/**
 * 通信服务
 */
export class MqttService {
    /**
     * 大网关客户端
     */
    client;
    /**
     * 通信服务构造函数
     */
    constructor() {}
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
        if (!isAvaliable(ProjectService.projectData?.server.gateway)) return;

        const { port, username, password } = ProjectService.projectData.server.gateway;
        // 网关监听设备服务
        const { host } = ProjectService.projectData.server.gateway;
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
        // client.on('packetreceive', this.onClientReceive);
    }
    /**
     * 连接成功
     */
    onClientConnect(e) {
        Log.info('MQTT已连接');
        this.isConnected = true;

        // this.subscribeView();
    }
    /**
     * 模式报警连接成功
     * @param e
     */
    onHciClientConnect(e) {
        Log.info('MQTT已连接');
        this.isHciConnected = true;

        // this.subscribeAlarm();
        // this.subscribeMode();
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
}
