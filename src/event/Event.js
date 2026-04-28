/**
 * 事件类
 */
export class Event {
    /** mqtt订阅成功 */
    static MQTT_SUBSCRIBE = 'mqtt_subscribe';
    /** mqtt消息总线 */
    static MQTT_MESSAGE = 'mqtt_message';
    /** mqtt设备消息 */
    static MQTT_PACKETSEND = 'mqtt_packetsend';
    /** mqtt设备消息 */
    static MQTT_PACKETRECEIVE = 'mqtt_packetreceive';
    /** mqtt设备消息 */
    static MQTT_DEVICE_MESSAGE = 'mqtt_device_message';
    /** mqtt告警消息 */
    static MQTT_ALARM_MESSAGE = 'mqtt_alarm_message';
    /** mqtt回复消息 */
    static MQTT_DOWN_REPLY = 'mqtt_down_reply';
    /** mqtt模式下发回复消息 */
    static MQTT_MODE_EXIT = 'mqtt_mode_stop';
    /** mqtt模式消息 */
    static MQTT_MODE_EXECUTE = 'mqtt_mode_start';
    /** mqtt在线离线消息 */
    static MQTT_ONLINE_STATUS = 'mqtt_online_status';
    /** 订阅在线离线消息 */
    static MQTT_ONLINE_SUBSCRIBE = 'mqtt_online_subscribe';
    /** 事件类型 */
    type;
    /** 事件数据 */
    data;
    /** 目标引用 */
    target;
    /**
     * 事件类
     * @param type 事件类型
     * @param data 选填
     */
    constructor(type, data) {
        this.type = type;
        if (data !== undefined && data !== null) this.data = data;
    }
}
