import Debug from 'debug';

const error = Debug('Error');
error.color = '#ff0000';
const log = Debug('Log');
log.color = '#2cdd2c';
const debug = Debug('Debug');
const warning = Debug('Warning');

function Log() {
    Object.defineProperty(this, 'level', {
        get: function () {
            return this._level;
        },

        set: function (n) {
            this._level = n;
            // 默认全关
            error.enabled = warning.enabled = log.enabled = debug.enabled = false;
            if (this._level > 0) {
                if (this._level >= 1) error.enabled = true;
                if (this._level >= 2) warning.enabled = true;
                if (this._level >= 3) log.enabled = true;
                if (this._level >= 4) debug.enabled = true;
            }
        },
    });

    // this.level = this.LOG_LEVEL.DEBUG;
    this.css = ['color:green', 'font-weight:bold'].join(';');
}

let startTime;
// 计时器
Log.prototype.timer = function () {
    startTime = +new Date();
};
Log.prototype.time = function (args) {
    console.log(`[INFO] %c${args} ${new Date().getTime() - startTime}ms`, this.css);
};

// 输出<=LogLevel的所有错误级别
Log.prototype.LOG_LEVEL = { NONE: 0, ERROR: 1, WARNING: 2, INFO: 3, DEBUG: 4 };
Log.prototype.error = error;
Log.prototype.info = Log.prototype.log = log;
Log.prototype.warning = warning;
Log.prototype.debug = debug;
Log.constructor = Log;

export default new Log();
