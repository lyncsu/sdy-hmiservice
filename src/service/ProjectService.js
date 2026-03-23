import axios from 'axios';
import { DrawioParser } from '../utils/DrawioParser';
import { extractPage, isAvaliable, validateDiagramNode, validateXML } from '../utils/Util';
import { Hmi } from '../model/Hmi';
import { Page } from '../model/Page';
/**
 * 项目工程服务
 */
class ProjectService {
    /**
     * 项目数据
     */
    projectDoc;
    /**
     * Hmi数据
     */
    hmi = new Hmi();
    /**
     * 获取当前页面
     */
    get currentPage() {
        return;
    }
    /**
     * 构造函数
     */
    constructor() {}
    /**
     * 加载工程数据
     * @param url
     * @returns
     */
    load(url) {
        return new Promise((resolve, reject) => {
            this.projectDoc = mxUtils.load(url);
            this.parseProjectXml();
            resolve();
        });
    }
    /**
     * 还原工程
     * @param {*} xml
     */
    parseProjectXml() {
        return new Promise((resolve, reject) => {
            const xml = this.projectDoc.getXml();
            if (!isAvaliable(xml)) reject('解析失败');
            this.hmi.pages = extractPage(xml);

            resolve('解析成功');
        });
    }
    /**
     * 通过名称获取视图
     * @param name
     * @param pages
     */
    hasPage(name) {
        // 如果已生成的实例中存在page, 返回true
        const exsit = this.hmi.pages.some(page => page.name === name);
        if (exsit) return true;
        return false;
    }
    /**
     * 加载页面
     */
    loadPage(name) {
        const exsit = this.hmi.pages.find(page => page.name === name);
        if (exsit) return exsit;
    }
}

export default new ProjectService();
