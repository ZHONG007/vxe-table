import XEUtils from 'xe-utils';
import GlobalConfig from '../../v-x-e-table/src/conf';
import { VXETable } from '../../v-x-e-table';
import { toFilters } from './util';
import { warnLog, errLog, getFuncText } from '../../tools/utils';
var ColumnInfo = /** @class */ (function () {
    /* eslint-disable @typescript-eslint/no-use-before-define */
    function ColumnInfo($xetable, _vm, _a) {
        var _b = _a === void 0 ? {} : _a, renderHeader = _b.renderHeader, renderCell = _b.renderCell, renderFooter = _b.renderFooter, renderData = _b.renderData;
        var $xegrid = $xetable.xegrid;
        var formatter = _vm.formatter;
        var visible = XEUtils.isBoolean(_vm.visible) ? _vm.visible : true;
        if (process.env.NODE_ENV === 'development') {
            var types = ['seq', 'checkbox', 'radio', 'expand', 'html'];
            if (_vm.type && types.indexOf(_vm.type) === -1) {
                warnLog('vxe.error.errProp', ["type=" + _vm.type, types.join(', ')]);
            }
            if (XEUtils.isBoolean(_vm.cellRender) || (_vm.cellRender && !XEUtils.isObject(_vm.cellRender))) {
                warnLog('vxe.error.errProp', ["column.cell-render=" + _vm.cellRender, 'column.cell-render={}']);
            }
            if (XEUtils.isBoolean(_vm.editRender) || (_vm.editRender && !XEUtils.isObject(_vm.editRender))) {
                warnLog('vxe.error.errProp', ["column.edit-render=" + _vm.editRender, 'column.edit-render={}']);
            }
            if (_vm.cellRender && _vm.editRender) {
                warnLog('vxe.error.errConflicts', ['column.cell-render', 'column.edit-render']);
            }
            if (_vm.type === 'expand') {
                var tableProps = $xetable.props;
                var treeConfig = tableProps.treeConfig;
                var computeTreeOpts = $xetable.getComputeMaps().computeTreeOpts;
                var treeOpts = computeTreeOpts.value;
                if (treeConfig && treeOpts.line) {
                    errLog('vxe.error.errConflicts', ['tree-config.line', 'column.type=expand']);
                }
            }
            if (formatter) {
                if (XEUtils.isString(formatter)) {
                    var globalFunc = VXETable.formats.get(formatter) || XEUtils[formatter];
                    if (!XEUtils.isFunction(globalFunc)) {
                        errLog('vxe.error.notFunc', [formatter]);
                    }
                }
                else if (XEUtils.isArray(formatter)) {
                    var globalFunc = VXETable.formats.get(formatter[0]) || XEUtils[formatter[0]];
                    if (!XEUtils.isFunction(globalFunc)) {
                        errLog('vxe.error.notFunc', [formatter[0]]);
                    }
                }
            }
        }
        Object.assign(this, {
            // ????????????
            type: _vm.type,
            property: _vm.field,
            title: _vm.title,
            width: _vm.width,
            minWidth: _vm.minWidth,
            resizable: _vm.resizable,
            fixed: _vm.fixed,
            align: _vm.align,
            headerAlign: _vm.headerAlign,
            footerAlign: _vm.footerAlign,
            showOverflow: _vm.showOverflow,
            showHeaderOverflow: _vm.showHeaderOverflow,
            showFooterOverflow: _vm.showFooterOverflow,
            className: _vm.className,
            headerClassName: _vm.headerClassName,
            footerClassName: _vm.footerClassName,
            formatter: formatter,
            sortable: _vm.sortable,
            sortBy: _vm.sortBy,
            sortType: _vm.sortType,
            filters: toFilters(_vm.filters),
            filterMultiple: XEUtils.isBoolean(_vm.filterMultiple) ? _vm.filterMultiple : true,
            filterMethod: _vm.filterMethod,
            filterResetMethod: _vm.filterResetMethod,
            filterRecoverMethod: _vm.filterRecoverMethod,
            filterRender: _vm.filterRender,
            treeNode: _vm.treeNode,
            cellType: _vm.cellType,
            cellRender: _vm.cellRender,
            editRender: _vm.editRender,
            contentRender: _vm.contentRender,
            exportMethod: _vm.exportMethod,
            footerExportMethod: _vm.footerExportMethod,
            titleHelp: _vm.titleHelp,
            // ???????????????
            params: _vm.params,
            // ????????????
            id: _vm.colId || XEUtils.uniqueId('col_'),
            parentId: null,
            visible: visible,
            // ???????????????????????????????????????????????????????????????
            halfVisible: false,
            defaultVisible: visible,
            checked: false,
            halfChecked: false,
            disabled: false,
            level: 1,
            rowSpan: 1,
            colSpan: 1,
            order: null,
            sortTime: 0,
            renderWidth: 0,
            renderHeight: 0,
            resizeWidth: 0,
            renderLeft: 0,
            renderArgs: [],
            model: {},
            renderHeader: renderHeader || _vm.renderHeader,
            renderCell: renderCell || _vm.renderCell,
            renderFooter: renderFooter || _vm.renderFooter,
            renderData: renderData,
            // ???????????????????????? grid ??????
            slots: _vm.slots
        });
        if ($xegrid) {
            var computeProxyOpts = $xegrid.getComputeMaps().computeProxyOpts;
            var proxyOpts = computeProxyOpts.value;
            if (proxyOpts.beforeColumn) {
                proxyOpts.beforeColumn({ $grid: $xegrid, column: this });
            }
        }
    }
    ColumnInfo.prototype.getTitle = function () {
        return getFuncText(this.title || (this.type === 'seq' ? GlobalConfig.i18n('vxe.table.seqTitle') : ''));
    };
    ColumnInfo.prototype.getKey = function () {
        return this.property || (this.type ? "type=" + this.type : null);
    };
    ColumnInfo.prototype.update = function (name, value) {
        // ????????????????????????
        if (name !== 'filters') {
            if (name === 'field') {
                this.property = value;
            }
            else {
                this[name] = value;
            }
        }
    };
    return ColumnInfo;
}());
export { ColumnInfo };
