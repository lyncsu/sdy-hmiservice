/**
 * 事件类
 */
export class Event {
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
