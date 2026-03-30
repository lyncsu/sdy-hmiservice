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
                gateway: {
                    host: '10.161.0.201',
                    port: 8085,
                    username: 'sec-dt',
                    password: 'SecdtEdge123456',
                },
            })
            .then(() => {});

        window.init = () => {};

        window.changePage = () => {};
    }
}
