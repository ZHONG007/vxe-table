import XEUtils from 'xe-utils';
import GlobalConfig from '../../v-x-e-table/src/conf';
import { VXETable } from '../../v-x-e-table';
import { browse } from '../../tools/dom';
import { getLog, parseFile } from '../../tools/utils';
// 导入
var fileForm;
var fileInput;
// 打印
var printFrame;
// 默认导出或打印的 HTML 样式
var defaultHtmlStyle = 'body{margin:0;color:#333333;font-size:14px;font-family:"Microsoft YaHei",微软雅黑,"MicrosoftJhengHei",华文细黑,STHeiti,MingLiu}body *{-webkit-box-sizing:border-box;box-sizing:border-box}.vxe-table{border-collapse:collapse;text-align:left;border-spacing:0}.vxe-table:not(.is--print){table-layout:fixed}.vxe-table,.vxe-table th,.vxe-table td,.vxe-table td{border-color:#D0D0D0;border-style:solid;border-width:0}.vxe-table.is--print{width:100%}.border--default,.border--full,.border--outer{border-top-width:1px}.border--default,.border--full,.border--outer{border-left-width:1px}.border--outer,.border--default th,.border--default td,.border--full th,.border--full td,.border--outer th,.border--inner th,.border--inner td{border-bottom-width:1px}.border--default,.border--outer,.border--full th,.border--full td{border-right-width:1px}.border--default th,.border--full th,.border--outer th{background-color:#f8f8f9}.vxe-table td>div,.vxe-table th>div{padding:.5em .4em}.col--center{text-align:center}.col--right{text-align:right}.vxe-table:not(.is--print) .col--ellipsis>div{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;word-break:break-all}.vxe-table--tree-node{text-align:left}.vxe-table--tree-node-wrapper{position:relative}.vxe-table--tree-icon-wrapper{position:absolute;top:50%;width:1em;height:1em;text-align:center;-webkit-transform:translateY(-50%);transform:translateY(-50%);-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:pointer}.vxe-table--tree-unfold-icon,.vxe-table--tree-fold-icon{position:absolute;width:0;height:0;border-style:solid;border-width:.5em;border-right-color:transparent;border-bottom-color:transparent}.vxe-table--tree-unfold-icon{left:.3em;top:0;border-left-color:#939599;border-top-color:transparent}.vxe-table--tree-fold-icon{left:0;top:.3em;border-left-color:transparent;border-top-color:#939599}.vxe-table--tree-cell{display:block;padding-left:1.5em}.vxe-table input[type="checkbox"]{margin:0}.vxe-table input[type="checkbox"],.vxe-table input[type="radio"],.vxe-table input[type="checkbox"]+span,.vxe-table input[type="radio"]+span{vertical-align:middle;padding-left:0.4em}';
export function createFrame() {
    var frame = document.createElement('iframe');
    frame.className = 'vxe-table--print-frame';
    return frame;
}
export function getExportBlobByContent(content, options) {
    if (window.Blob) {
        return new Blob([content], { type: "text/" + options.type + ";charset=utf-8;" });
    }
    return null;
}
export function createHtmlPage(opts, content) {
    var style = opts.style;
    return [
        '<!DOCTYPE html><html>',
        '<head>',
        '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,minimal-ui">',
        "<title>" + opts.sheetName + "</title>",
        "<style>" + defaultHtmlStyle + "</style>",
        style ? "<style>" + style + "</style>" : '',
        '</head>',
        "<body>" + content + "</body>",
        '</html>'
    ].join('');
}
/**
 * 读取本地文件
 * @param {*} options 参数
 */
export var readLocalFile = function (options) {
    var opts = Object.assign({}, options);
    if (!fileForm) {
        fileForm = document.createElement('form');
        fileInput = document.createElement('input');
        fileForm.className = 'vxe-table--file-form';
        fileInput.name = 'file';
        fileInput.type = 'file';
        fileForm.appendChild(fileInput);
        document.body.appendChild(fileForm);
    }
    return new Promise(function (resolve, reject) {
        var types = opts.types || [];
        var isAllType = !types.length || types.some(function (type) { return type === '*'; });
        fileInput.multiple = !!opts.multiple;
        fileInput.accept = isAllType ? '' : "." + types.join(', .');
        fileInput.onchange = function (evnt) {
            var files = evnt.target.files;
            var file = files[0];
            var errType = '';
            // 校验类型
            if (!isAllType) {
                for (var fIndex = 0; fIndex < files.length; fIndex++) {
                    var type = parseFile(files[fIndex]).type;
                    if (!XEUtils.includes(types, type)) {
                        errType = type;
                        break;
                    }
                }
            }
            if (!errType) {
                resolve({ status: true, files: files, file: file });
            }
            else {
                if (opts.message !== false) {
                    VXETable.modal.message({ content: GlobalConfig.i18n('vxe.error.notType', [errType]), status: 'error' });
                }
                var params = { status: false, files: files, file: file };
                reject(params);
            }
        };
        fileForm.reset();
        fileInput.click();
    });
};
function removePrintFrame() {
    if (printFrame) {
        if (printFrame.parentNode) {
            try {
                printFrame.contentDocument.write('');
            }
            catch (e) { }
            printFrame.parentNode.removeChild(printFrame);
        }
        printFrame = null;
    }
}
function appendPrintFrame() {
    if (!printFrame.parentNode) {
        document.body.appendChild(printFrame);
    }
}
function afterPrintEvent() {
    requestAnimationFrame(removePrintFrame);
}
export function handlePrint($xetable, opts, content) {
    if (content === void 0) { content = ''; }
    var beforePrintMethod = opts.beforePrintMethod;
    if (beforePrintMethod) {
        content = beforePrintMethod({ content: content, options: opts, $table: $xetable }) || '';
    }
    content = createHtmlPage(opts, content);
    var blob = getExportBlobByContent(content, opts);
    if (browse.msie) {
        removePrintFrame();
        printFrame = createFrame();
        appendPrintFrame();
        printFrame.contentDocument.write(content);
        printFrame.contentDocument.execCommand('print');
    }
    else {
        if (!printFrame) {
            printFrame = createFrame();
            printFrame.onload = function (evnt) {
                if (evnt.target.src) {
                    evnt.target.contentWindow.onafterprint = afterPrintEvent;
                    evnt.target.contentWindow.print();
                }
            };
        }
        appendPrintFrame();
        printFrame.src = URL.createObjectURL(blob);
    }
}
/**
 * 保存文件到本地
 * @param {*} options 参数
 */
export var saveLocalFile = function (options) {
    var filename = options.filename, type = options.type, content = options.content;
    var name = filename + "." + type;
    if (window.Blob) {
        var blob = content instanceof Blob ? content : getExportBlobByContent(XEUtils.toValueString(content), options);
        if (navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, name);
        }
        else {
            var linkElem = document.createElement('a');
            linkElem.target = '_blank';
            linkElem.download = name;
            linkElem.href = URL.createObjectURL(blob);
            document.body.appendChild(linkElem);
            linkElem.click();
            document.body.removeChild(linkElem);
        }
        return Promise.resolve();
    }
    return Promise.reject(new Error(getLog('vxe.error.notExp')));
};
