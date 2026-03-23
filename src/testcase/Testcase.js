import hmicore from '../Hmicore';

/**
 * 测试用例类
 */
export class Testcase {
    /**
     * 测试用例构造函数
     */
    constructor() {
        hmicore
            .init({
                containerId: 'hmi-container',
                url: 'project.xml',
                element_url: 'element.js',
            })
            .then(() => {
                hmicore.changePage('Page-2');
            });

        window.init = () => {};

        window.changePage = () => {
            hmicore.changePage('Page-1');
        };
    }
}
