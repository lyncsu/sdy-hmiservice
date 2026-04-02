// import { Hmi } from '../model/Hmi';
import { ProjectData } from '../model/ProjectData';

/**
 * 项目工程服务
 */
export default class ProjectService {
    /**
     * 项目数据
     */
    projectData;
    /**
     * 构造函数
     */
    constructor() {
        this.projectData = new ProjectData();
    }
}
