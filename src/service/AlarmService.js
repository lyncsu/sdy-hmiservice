import EventDispatcher from '../event/EventDispatcher';

export class AlarmService extends EventDispatcher {
    // 每隔定时刷新一次
    static REFRESH_INTERVAL = 1 * 60 * 1000;

    constructor() {
        this.bindScope();
        this.init();
    }

    init() {}

    bindScope() {}
}
