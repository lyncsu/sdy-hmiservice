import hmiService from '../HmiService';

/**
 * 测试用例类
 */
export class Testcase {
    /**
     * 测试用例构造函数
     */
    constructor() {
        hmiService
            .init({
                containerId: 'hmi-container',
            })
            .then(() => {});

        window.init = () => {};

        window.changePage = () => {};
    }
}
