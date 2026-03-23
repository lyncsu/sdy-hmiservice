import { Event } from "./Event";
/**
 * 事件派发器类
 */
export default class EventDispatcher {
  /**
   * 唯一标识
   */
  id;
  /**
   * 类型
   */
  type;
  /**
   * 侦听者列表
   */
  _listeners;
  /**
   * 事件启用标签
   */
  _eventEnabled = true;
  /**
   * 获取事件启用状态
   */
  get eventEnabled() {
    return this._eventEnabled;
  }
  /**
   * 设置事件启用状态
   */
  set eventEnabled(value) {
    this._eventEnabled = value;
  }
  /**
   * 调用封装 - 派发
   * @param {*} event
   * @param {*} data
   */
  emit(event, data) {
    this.dispatchEvent(event, data);
  }
  /**
   * 调用封装 - 侦听
   * @param {*} event
   * @param {*} data
   */
  on(event, data) {
    this.addEventListener(event, data);
  }
  /**
   * 调用封装 - 移除
   * @param {*} event
   * @param {*} data
   */
  off(type, listener) {
    this.removeEventListener(type, listener);
  }
  /**
   * 调用封装 - 清除
   * @param {*} event
   * @param {*} data
   */
  clear(type) {
    this.clearEventListener(type);
  }
  /**
   * 派发事件
   * @param event
   * @param data
   */
  dispatchEvent(event, data) {
    let e;
    if (event instanceof Event) {
      e = event;
      e.target = this;
    } else if (event instanceof KeyboardEvent) {
      e = event;
    } else {
      e = new Event(event, data);
    }

    if (this._listeners === undefined) return;

    const listenerArray = this._listeners[e.type];
    if (listenerArray !== undefined) {
      if (e instanceof Event) e.target = this;
      const array = listenerArray.slice(0);
      for (let i = 0, l = array.length; i < l; i++) {
        array[i].call(this, e);
      }
    }
  }
  /**
   * 添加侦听
   * @param type
   * @param listener
   */
  addEventListener(type, listener) {
    if (this._listeners === undefined) this._listeners = {};
    if (this._listeners[type] === undefined) this._listeners[type] = [];

    if (listener instanceof Array)
      listener.forEach((child) => {
        if (this._listeners[type].indexOf(child) === -1)
          this._listeners[type].push(child);
      });
    else if (this._listeners[type].indexOf(listener) === -1)
      this._listeners[type].push(listener);
  }
  /**
   * 清除全部侦听
   * @param {*} type
   */
  clearEventListener(type) {
    if (
      this._listeners &&
      this._listeners[type] &&
      this._listeners[type].length
    )
      this._listeners[type].length = 0;
  }
  /**
   * 判断是否有侦听
   * @param type
   * @param listener
   */
  hasEventListener(type, listener) {
    if (this._listeners === undefined) return false;

    return (
      this._listeners[type] !== undefined &&
      this._listeners[type].indexOf(listener) !== -1
    );
  }
  /**
   * 移除侦听
   * @param type
   * @param listener
   */
  removeEventListener(type, listener) {
    if (this._listeners === undefined) return;

    const listenerArray = this._listeners[type];
    if (listenerArray !== undefined) {
      const index = listenerArray.indexOf(listener);
      if (index !== -1) listenerArray.splice(index, 1);
    }
  }
  /**
   * 内存释放
   */
  dispose() {
    this._listeners = undefined;
    this.type = undefined;
  }
}
