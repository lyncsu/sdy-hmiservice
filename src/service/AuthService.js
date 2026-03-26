import { isAvaliable } from '../utils/Util';

/**
 * 权限信息服务
 */
class AuthService {
    // window.isCenter ：Boolean //  true 表示当前登录角色是中央 false 表示是车站角色
    // window.currentSys : keyof authObj // HMI当前页面展示哪个系统 值为 dxt、xxt、...
    permission = {
        dxt: 1, //大系统 1=中心HMI|2=车站|3=IBP
        xxt: 1, //小系统
        sdt: 1, //隧道通风
        zmxt: 1, //照明系统
        jpsxt: 1, // 给排水
        ktsxt: 1, // 空调水系统
    };
    /**
     * 权限信息服务构造函数
     */
    constructor() {}
    /**
     * 检查权限
     * @returns
     */
    checkPermission() {
        // 没有权限数据, 放行
        if (!isAvaliable(this.permission)) return true;
        // 无系统信息, 直接放行
        if (!isAvaliable(window.currentSys)) return true;

        const obj = this.permission;
        if (Object.keys(this.permission).includes(window.currentSys)) {
            // 当前登录角色是中心且当前系统主控在中心，则放行
            if (obj[window.currentSys] === 1 && window.isCenter) return true;
            else if (obj[window.currentSys] === 2 && !window.isCenter) return true;
            else return false;
        } else {
            return true;
        }
    }
}

export default new AuthService();
