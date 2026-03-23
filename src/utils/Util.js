import { Page } from '../model/Page';

/**
 * 检查对象是否可用
 * @param object
 * @returns
 */
export function isAvaliable(object) {
    const type = typeof object;

    if (type === 'undefined') return false;
    if (type === 'number' || type === 'bigint') return !Number.isNaN(object);
    if (type === 'string') return object.length !== 0;
    if (type === 'boolean' || type === 'function' || type === 'symbol') return true;
    if (type === 'object') {
        if (object === null) return false;
        if (object instanceof Array) return object.length !== 0;
        if (object instanceof Map || object instanceof Set) return object.size !== 0;
        return Object.keys(object).length !== 0;
    }
}
/**
 * 克隆
 * @param {*} obj
 */
export function clone(data) {
    return JSON.parse(JSON.stringify(data));
}
/**
 * 动态加载js文件
 * @param {string} url - JS 文件的 URL
 * @param {Object} options - 配置选项
 * @param {boolean} options.async - 是否异步加载，默认 true
 * @param {boolean} options.defer - 是否延迟执行，默认 false
 * @param {string} options.id - script 标签的 id
 * @returns {Promise} 返回 Promise，加载成功 resolve，失败 reject
 */
export function loadScript(url, options = {}) {
    return new Promise((resolve, reject) => {
        // 检查是否已经加载过该脚本
        const existingScript = document.querySelector(`script[src="${url}"]`);
        if (existingScript) {
            resolve({ message: '脚本已存在', script: existingScript });
            return;
        }
        // 创建 script 标签
        const script = document.createElement('script');
        script.src = url;
        script.type = 'text/javascript';

        // 设置配置选项
        if (options.async !== undefined) script.async = options.async;
        else script.async = true; // 默认异步
        if (options.defer) script.defer = options.defer;
        if (options.id) script.id = options.id;

        // 加载成功
        script.onload = () => {
            resolve({ message: '脚本加载成功', script });
        };
        // 加载失败
        script.onerror = () => {
            reject(new Error(`脚本加载失败: ${url}`));
            // 加载失败时移除 script 标签
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };

        // 添加到 DOM
        document.head.appendChild(script);
    });
}
/**
 * 验证是否为合法的xml
 */
export function validateXML(target) {
    try {
        if (typeof target === 'string') {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(target, 'text/xml');
            // 检查是否有解析错误
            const parseError = xmlDoc.getElementsByTagName('parsererror');
            if (parseError.length > 0) return false;

            return true;
        } else {
            return String(target).includes('XMLDocument');
        }
    } catch (error) {
        return false;
    }
}
/**
 * 解析具体页面
 * @param {*} node
 */
export function extractPage(xml) {
    if (!isAvaliable(xml)) return [];

    const diagrams = xml.getElementsByTagName('diagram');
    if (!isAvaliable(diagrams)) return [];
    // const dec = new mxCodec(node.ownerDocument);
    const pages = [];
    for (let i = 0; i < diagrams.length; i++) {
        const page = new Page(diagrams[i]);
        if (!isAvaliable(page.name)) page.name = `Page-${i + 1}`;

        pages.push(page);
    }
    return pages;
}
/**
 * 提取视图节点
 * @param {*} diagramNode
 * @param {*} checked
 * @param {*} allowRecurse
 * @returns
 */
export function parseDiagramNode(diagramNode, checked, allowRecurse) {
    validateDiagramNode(diagramNode);
    var text = mxUtils.trim(mxUtils.getTextContent(diagramNode));
    var node = null;

    if (text.length > 0) {
        var tmp = Graph.decompress(text, null, checked);

        if (tmp != null && tmp.length > 0) {
            node = mxUtils.parseXml(tmp).documentElement;
        }
    } else {
        var temp = mxUtils.getChildNodes(diagramNode);

        if (temp.length > 0) {
            var tempNode = temp[0];

            if (allowRecurse) {
                tempNode = Editor.parseDiagramNode(tempNode, checked, false);
            }

            // Creates new document for unique IDs within mxGraphModel
            var doc = mxUtils.createXmlDocument();
            doc.appendChild(doc.importNode(tempNode, true));
            node = doc.documentElement;
        }
    }

    return node;
}
/**
 * 提取Graph模型
 * @param {*} node
 * @param {*} allowMxFile
 * @param {*} checked
 * @returns
 */
export function extractGraphModel(node, allowMxFile, checked) {
    if (node != null && typeof pako !== 'undefined') {
        var tmp = node.ownerDocument.getElementsByTagName('div');
        var divs = [];

        if (tmp != null && tmp.length > 0) {
            for (var i = 0; i < tmp.length; i++) {
                if (tmp[i].getAttribute('class') == 'mxgraph') {
                    divs.push(tmp[i]);
                    break;
                }
            }
        }

        if (divs.length > 0) {
            var data = divs[0].getAttribute('data-mxgraph');

            if (data != null) {
                var config = JSON.parse(data);

                if (config != null && config.xml != null) {
                    var doc2 = mxUtils.parseXml(config.xml);
                    node = doc2.documentElement;
                }
            } else {
                var divs2 = divs[0].getElementsByTagName('div');

                if (divs2.length > 0) {
                    var data = mxUtils.getTextContent(divs2[0]);
                    data = Graph.decompress(data, null, checked);

                    if (data.length > 0) {
                        var doc2 = mxUtils.parseXml(data);
                        node = doc2.documentElement;
                    }
                }
            }
        }
    }

    if (node != null && node.nodeName == 'svg') {
        var tmp = node.getAttribute('content');

        if (tmp != null && tmp.charAt(0) != '<' && tmp.charAt(0) != '%') {
            tmp = unescape(window.atob ? atob(tmp) : Base64.decode(cont, tmp));
        }

        if (tmp != null && tmp.charAt(0) == '%') {
            tmp = decodeURIComponent(tmp);
        }

        if (tmp != null && tmp.length > 0) {
            node = mxUtils.parseXml(tmp).documentElement;
        } else {
            throw { message: mxResources.get('notADiagramFile') };
        }
    }

    if (node != null && !allowMxFile) {
        var diagramNode = null;

        if (node.nodeName == 'diagram') {
            diagramNode = node;
        } else if (node.nodeName == 'mxfile') {
            var diagrams = node.getElementsByTagName('diagram');

            if (diagrams.length > 0) {
                diagramNode = diagrams[Math.max(0, Math.min(diagrams.length - 1, urlParams['page'] || 0))];
            }
        }

        if (diagramNode != null) {
            node = parseDiagramNode(diagramNode, checked);
        }
    }

    if (node != null && node.nodeName != 'mxGraphModel' && (!allowMxFile || node.nodeName != 'mxfile')) {
        node = null;
    }

    return node;
}
/**
 * 验证是否为合法node
 * @param {*} diagramNode
 * @returns
 */
export function validateDiagramNode(diagramNode) {
    if (
        mxUtils.trim(mxUtils.getTextContent(diagramNode)).length == 0 &&
        mxUtils.getChildNodes(diagramNode).length == 0
    ) {
        let codec = new mxCodec();
        let model = new mxGraphModel();
        diagramNode.appendChild(codec.encode(model));
    }

    return diagramNode;
}
/**
 * 生成唯一id
 * @returns
 */
export function guid() {
    const GUID_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_';
    const len = length != null ? length : 20;
    const rtn = [];
    for (let i = 0; i < len; i++) {
        rtn.push(GUID_ALPHABET.charAt(Math.floor(Math.random() * GUID_ALPHABET.length)));
    }
    return rtn.join('');
}
