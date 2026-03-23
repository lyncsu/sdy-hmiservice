import ProjectService from './service/ProjectService';
import EventDispatcher from './event/EventDispatcher';
import { isAvaliable } from './utils/Util';
/**
 * Hmi运行时
 */
class HmiService extends EventDispatcher {
    /**
     * 初始化完成
     */
    _initialized;
    /**
     * 构造函数
     */
    constructor() {
        super();

        this._initialized = false;

        window.project = ProjectService;
    }
    /**
     * 初始化
     * @param {*} params
     * @returns
     */
    init(
        params = {
            url: '/project.json',
            debug: true,
        },
    ) {
        return new Promise((resolve, reject) => {
            if (!isAvaliable(params?.url)) return reject('url项目配置路径必填');
            if (!isAvaliable(params?.containerId)) return reject('containerId渲染容器必填');
            if (!isAvaliable(params?.element_url)) return reject('element_url图元路径必填');
            if (isAvaliable(params?.debug)) Global.debug = params?.debug;
            // 注册渲染器
            Renderer.register(params.containerId);
            // 加载图元库
            loadScript(params?.element_url).then(
                () => {
                    // 加载项目配置
                    ProjectService.load(params.url).then(
                        () => {
                            this._initialized = true;
                            resolve();
                            this.emit('loaded');
                            // 登录信息
                            // if (isAvaliable(params?.auth)) this.login(params.auth);
                        },
                        err => {
                            const msg = '项目文件读取失败, 请检查配置路径是否正确';
                            console.error(msg, err);
                            // this.logService.error(msg, err);
                            reject(msg);
                        },
                    );
                },
                err => {
                    reject(err);
                },
            );
        });
    }
    /**
     * 切换视图
     * @param {*} param
     */
    changeView(param) {
        return this.changePage(param);
    }
    /**
     * 切换视图
     * @param {*} param
     * @returns
     */
    changePage(param) {
        return new Promise((resolve, reject) => {
            if (!this._initialized) reject('尚未初始化完成');
            if (!isAvaliable(param)) return reject('请传入正确的视图名称或id');

            const hasPage = ProjectService.hasPage(param);
            if (!hasPage) return reject('找不到对应名称的视图');

            const loaded = ProjectService.loadPage(param);
            Renderer.renderPage(loaded);
            // this.propertyPanel?.hide();
            resolve();
        });
    }
}

export default new HmiService();
