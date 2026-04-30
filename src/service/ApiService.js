import axios from 'axios';
import Log from '../utils/Log';
import Api from './Api';
import { isAvaliable } from '../utils/Util';

class ApiService {
    /**
     * 初始化
     * @returns
     */
    init(projectService) {
        const res = Api.register(projectService.projectData.server);
        if (res.code !== 0) return Log.error(res.msg);
    }
    /**
     * 按deviceSn获取设备影子
     * @param deviceSns
     * @returns
     */
    loadDeviceShadowByDeviceSn(params) {
        return new Promise(async (resolve, reject) => {
            const url = 'deviceShadow/list';
            try {
                const deviceSns = typeof params === 'string' ? [params] : params;
                const batchSize = 200; // 每批请求200个设备
                const batches = [];
                // 将deviceSns分成每批200个的子数组
                for (let i = 0; i < deviceSns.length; i += batchSize) {
                    batches.push(deviceSns.slice(i, i + batchSize));
                }
                // 创建所有批次的请求Promise数组
                const batchPromises = batches.map(async (batch, index) => {
                    try {
                        Log.info(`正在请求第${index + 1}批设备影子数据（共${batches.length}批）`);
                        const res = await axios.get(Api.get(url), {
                            params: {
                                deviceSns: batch.join(','),
                            },
                        });

                        if (!this.checkValidResponse(res)) {
                            Log.error(`第${index + 1}批设备影子加载失败: ${url}`, res.data.msg);
                            return [];
                        }

                        return res.data.data || [];
                    } catch (err) {
                        if (axios.isCancel(err)) {
                            Log.info(`第${index + 1}批设备影子加载已被取消`);
                            throw err; // 重新抛出取消错误，让外层处理
                        }

                        // 处理单批次请求中的错误，但不中断整体流程
                        Log.error(`第${index + 1}批设备影子加载失败`, err);
                        return []; // 返回空数组，让其他批次能够继续
                    }
                });
                // 等待所有批次请求完成
                const results = await Promise.all(batchPromises);
                // 合并所有批次的结果
                const allDevices = [];
                for (let i = 0; i < results.length; i++) {
                    const batchResult = results[i];
                    if (Array.isArray(batchResult)) {
                        for (let j = 0; j < batchResult.length; j++) {
                            allDevices.push(batchResult[j]);
                        }
                    }
                }
                resolve(allDevices);
                Log.info(`设备影子全部加载完成，共${allDevices.length}个设备`);
            } catch (err) {
                console.info(err);
                const isCancel = axios.isCancel(err);
                if (isCancel) {
                    Log.info('设备影子加载已被取消');
                }
                // 处理其他类型的错误
                if (err.response) {
                    // 服务器返回错误状态码
                    Log.error(`设备影子加载失败: ${url}`);
                } else if (err.request) {
                    // 请求发送成功但没有收到响应
                    Log.error(`设备影子请求超时或无响应: ${url}`);
                } else {
                    // 请求配置出错
                    Log.error(`设备影子请求配置错误: ${url}`, err.message);
                }
                if (!isCancel)
                    this.toastr.error('网络错误', '设备影子接口', {
                        timeOut: 3000,
                        closeButton: true,
                        // disableTimeOut: true
                    });
                reject(err);
                // 处理获取过程中的任何错误
                Log.error('设备影子加载失败', err);
            }
        });
    }
    /**
     * 检测是否合法返回值
     * @param res
     * @param noToast
     * @returns
     */
    checkValidResponse(res, noToast = false) {
        let hasError;
        if (!isAvaliable(res)) hasError = true;
        else if (!isAvaliable(res.data)) hasError = true;
        else if (res.data.code !== 200 && res.data.code !== 0) hasError = true;
        else hasError = false;

        if (hasError && !noToast) {
            Log.error(res?.data?.msg ? res?.data?.msg : `数据获取失败`);
            return false;
        }
        return true;
    }
}

export default new ApiService();
