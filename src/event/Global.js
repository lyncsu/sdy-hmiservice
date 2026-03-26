import EventDispatcher from './EventDispatcher';

class Global extends EventDispatcher {
    /** 调试模式 */
    debug = false;
}

export default new Global();
