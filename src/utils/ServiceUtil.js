import { MqttMessageType } from '../service/MqttService';
import { isAvaliable } from './Util';
/**
 * 从topic提取设备
 * @param topic
 * @returns
 */
export function getDeviceFromTopic(topic) {
    const match = topic.match(/v1\/(.*)\/sys\//);
    return match ? match[1] : null;
}
/**
 * 检查是否为设备上行topic
 * @param topic
 * @returns
 */
export function checkDeviceTopic(topic) {
    if (!isAvaliable(topic)) return false;
    if (typeof topic === 'string' && topic.indexOf('/sys/event/up') !== -1) return true;
    return false;
}
/**
 * 检查是否为新生成报警topic
 * @param topic
 * @returns
 */
export function checkNewAlarmTopic(topic) {
    if (!isAvaliable(topic)) return false;
    if (typeof topic === 'string' && topic.indexOf('/hci/alarm/generate') !== -1) return true;
    return false;
}
/**
 * 检查是否为新生成报警topic
 * @param topic
 * @returns
 */
export function checkValidAlarmMqtt(data) {
    if (!isAvaliable(data?.topic) || !isAvaliable(data?.message)) return false;
    if (typeof data.topic === 'string' && data.topic.indexOf('/hci/alarm/') !== -1) return true;
    return false;
}
/**
 * 改变字符串类型为boolean/number
 * @param param
 * @returns
 */
export function changeStringType(param) {
    if (typeof param === 'string') {
        if (param === 'true') return true;
        else if (param === 'false') return false;
        else if (/^-?\d+(\.\d+)?$/.test(param)) return Number(param);
    }
    return param;
}

/**
 * 根据类型改变返回字段
 * @param param
 * @returns
 */
export function changeAOType(value, valueType) {
    if (!isAvaliable(valueType)) return value;

    const type = String(valueType).toLowerCase();
    if (type === 'bool') return Boolean(value);
    if (type === 'string') return String(value);
    return Number(value);
}

export function filterDeviceTypeNode(data) {
    if (!isAvaliable(data)) return;
    delete data['updateTime'];
    delete data['createTime'];
    return data;
}

export function filterDeviceTypeNodes(data) {
    if (!isAvaliable(data)) return;
    return data.map(item => {
        delete item['updateTime'];
        delete item['createTime'];
        if (isAvaliable(item.children)) filterDeviceTypeNodes(item.children);
        return item;
    });
}

/**
 * 通过topic检查消息类型
 * @param topic
 * @returns
 */
export function checkTypeByTopic(topic) {
    if (typeof topic !== 'string') return MqttMessageType.UNKNOWN;
    if (topic.indexOf('sys/property/up') !== -1) return MqttMessageType.DEVICE;
    if (topic.indexOf('hci/alarm') !== -1) return MqttMessageType.ALARM;
    if (topic.indexOf('sys/property/down_reply') !== -1) return MqttMessageType.DOWN_REPLY;
    if (topic.indexOf('hci/hmi/mode/notice/start') !== -1) return MqttMessageType.MODE_EXECUTE;
    if (topic.indexOf('hci/hmi/mode/notice/stop/response') !== -1) return MqttMessageType.MODE_EXIT;
    if (topic.indexOf('sys/onlinestatus/up') !== -1) return MqttMessageType.ONLINE;
    return MqttMessageType.UNKNOWN;
}
