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
                debug: true,
            })
            .then(() => {});

        hmiService.on('mqtt_device_message', e => {
            console.info('客户端-------消息!', e);
        });

        window.subscribeDevice = () => {
            hmiService.subscribeDevice('VAC-TVF-01', 'TVFTEST1', true).then(res => {
                console.info('客户端-------订阅!', res);
            });
        };

        window.unsubscribeDevice = () => {
            hmiService.unsubscribeDevice('VAC-TVF-01', 'TVFTEST1').then(res => {
                console.info('客户端-------取消!', res);
            });
        };
    }
}
