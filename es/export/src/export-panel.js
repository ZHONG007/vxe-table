import { defineComponent, h, createCommentVNode, ref, computed, reactive, inject, nextTick } from 'vue';
import XEUtils from 'xe-utils';
import GlobalConfig from '../../v-x-e-table/src/conf';
import { formatText } from '../../tools/utils';
import VxeModalConstructor from '../../modal/src/modal';
import VxeInputConstructor from '../../input/src/input';
import VxeCheckboxConstructor from '../../checkbox/src/checkbox';
import VxeSelectConstructor from '../../select/src/select';
import VxeButtonConstructor from '../../button/src/button';
export default defineComponent({
    name: 'VxeExportPanel',
    props: {
        defaultOptions: Object,
        storeData: Object
    },
    setup: function (props) {
        var $xetable = inject('$xetable', {});
        var _a = $xetable.getComputeMaps(), computeExportOpts = _a.computeExportOpts, computePrintOpts = _a.computePrintOpts;
        var reactData = reactive({
            isAll: false,
            isIndeterminate: false,
            loading: false
        });
        var xButtonConfirm = ref();
        var xInputFilename = ref();
        var xInputSheetname = ref();
        var computeCheckedAll = computed(function () {
            var storeData = props.storeData;
            return storeData.columns.every(function (column) { return column.checked; });
        });
        var computeShowSheet = computed(function () {
            var defaultOptions = props.defaultOptions;
            return ['html', 'xml', 'xlsx', 'pdf'].indexOf(defaultOptions.type) > -1;
        });
        var computeSupportMerge = computed(function () {
            var storeData = props.storeData, defaultOptions = props.defaultOptions;
            return !defaultOptions.original && defaultOptions.mode === 'current' && (storeData.isPrint || ['html', 'xlsx'].indexOf(defaultOptions.type) > -1);
        });
        var computeSupportStyle = computed(function () {
            var defaultOptions = props.defaultOptions;
            return !defaultOptions.original && ['xlsx'].indexOf(defaultOptions.type) > -1;
        });
        var handleOptionCheck = function (column) {
            var storeData = props.storeData;
            var matchObj = XEUtils.findTree(storeData.columns, function (item) { return item === column; });
            if (matchObj && matchObj.parent) {
                var parent_1 = matchObj.parent;
                if (parent_1.children && parent_1.children.length) {
                    parent_1.checked = parent_1.children.every(function (column) { return column.checked; });
                    parent_1.halfChecked = !parent_1.checked && parent_1.children.some(function (column) { return column.checked || column.halfChecked; });
                    handleOptionCheck(parent_1);
                }
            }
        };
        var checkStatus = function () {
            var storeData = props.storeData;
            var columns = storeData.columns;
            reactData.isAll = columns.every(function (column) { return column.disabled || column.checked; });
            reactData.isIndeterminate = !reactData.isAll && columns.some(function (column) { return !column.disabled && (column.checked || column.halfChecked); });
        };
        var changeOption = function (column) {
            var isChecked = !column.checked;
            XEUtils.eachTree([column], function (item) {
                item.checked = isChecked;
                item.halfChecked = false;
            });
            handleOptionCheck(column);
            checkStatus();
        };
        var allColumnEvent = function () {
            var storeData = props.storeData;
            var isAll = !reactData.isAll;
            XEUtils.eachTree(storeData.columns, function (column) {
                if (!column.disabled) {
                    column.checked = isAll;
                    column.halfChecked = false;
                }
            });
            reactData.isAll = isAll;
            checkStatus();
        };
        var showEvent = function () {
            nextTick(function () {
                var filenameInp = xInputFilename.value;
                var sheetnameInp = xInputSheetname.value;
                var confirmBtn = xButtonConfirm.value;
                var targetElem = filenameInp || sheetnameInp || confirmBtn;
                if (targetElem) {
                    targetElem.focus();
                }
            });
            checkStatus();
        };
        var getExportOption = function () {
            var storeData = props.storeData, defaultOptions = props.defaultOptions;
            var hasMerge = storeData.hasMerge, columns = storeData.columns;
            var checkedAll = computeCheckedAll.value;
            var supportMerge = computeSupportMerge.value;
            var expColumns = XEUtils.searchTree(columns, function (column) { return column.checked; }, { children: 'children', mapChildren: 'childNodes', original: true });
            return Object.assign({}, defaultOptions, {
                columns: expColumns,
                isMerge: hasMerge && supportMerge && checkedAll ? defaultOptions.isMerge : false
            });
        };
        var printEvent = function () {
            var storeData = props.storeData;
            var printOpts = computePrintOpts.value;
            storeData.visible = false;
            $xetable.print(Object.assign({}, printOpts, getExportOption()));
        };
        var exportEvent = function () {
            var storeData = props.storeData;
            var exportOpts = computeExportOpts.value;
            reactData.loading = true;
            $xetable.exportData(Object.assign({}, exportOpts, getExportOption())).then(function () {
                reactData.loading = false;
                storeData.visible = false;
            }).catch(function () {
                reactData.loading = false;
            });
        };
        var cancelEvent = function () {
            var storeData = props.storeData;
            storeData.visible = false;
        };
        var confirmEvent = function () {
            var storeData = props.storeData;
            if (storeData.isPrint) {
                printEvent();
            }
            else {
                exportEvent();
            }
        };
        var renderVN = function () {
            var defaultOptions = props.defaultOptions, storeData = props.storeData;
            var isAll = reactData.isAll, isIndeterminate = reactData.isIndeterminate;
            var hasTree = storeData.hasTree, hasMerge = storeData.hasMerge, isPrint = storeData.isPrint, hasColgroup = storeData.hasColgroup;
            var isHeader = defaultOptions.isHeader;
            var cols = [];
            var checkedAll = computeCheckedAll.value;
            var showSheet = computeShowSheet.value;
            var supportMerge = computeSupportMerge.value;
            var supportStyle = computeSupportStyle.value;
            XEUtils.eachTree(storeData.columns, function (column) {
                var colTitle = formatText(column.getTitle(), 1);
                var isColGroup = column.children && column.children.length;
                cols.push(h('li', {
                    class: ['vxe-export--panel-column-option', "level--" + column.level, {
                            'is--group': isColGroup,
                            'is--checked': column.checked,
                            'is--indeterminate': column.halfChecked,
                            'is--disabled': column.disabled
                        }],
                    title: colTitle,
                    onClick: function () {
                        if (!column.disabled) {
                            changeOption(column);
                        }
                    }
                }, [
                    h('span', {
                        class: 'vxe-checkbox--icon vxe-checkbox--checked-icon'
                    }),
                    h('span', {
                        class: 'vxe-checkbox--icon vxe-checkbox--unchecked-icon'
                    }),
                    h('span', {
                        class: 'vxe-checkbox--icon vxe-checkbox--indeterminate-icon'
                    }),
                    h('span', {
                        class: 'vxe-checkbox--label'
                    }, colTitle)
                ]));
            });
            return h(VxeModalConstructor, {
                modelValue: storeData.visible,
                title: GlobalConfig.i18n(isPrint ? 'vxe.export.printTitle' : 'vxe.export.expTitle'),
                width: 660,
                mask: true,
                lockView: true,
                showFooter: false,
                escClosable: true,
                maskClosable: true,
                loading: reactData.loading,
                'onUpdate:modelValue': function (value) {
                    storeData.visible = value;
                },
                onShow: showEvent
            }, {
                default: function () {
                    return h('div', {
                        class: 'vxe-export--panel'
                    }, [
                        h('table', {
                            cellspacing: 0,
                            cellpadding: 0,
                            border: 0
                        }, [
                            h('tbody', [
                                [
                                    isPrint ? createCommentVNode() : h('tr', [
                                        h('td', GlobalConfig.i18n('vxe.export.expName')),
                                        h('td', [
                                            h(VxeInputConstructor, {
                                                ref: xInputFilename,
                                                modelValue: defaultOptions.filename,
                                                type: 'text',
                                                clearable: true,
                                                placeholder: GlobalConfig.i18n('vxe.export.expNamePlaceholder'),
                                                'onUpdate:modelValue': function (value) {
                                                    defaultOptions.filename = value;
                                                }
                                            })
                                        ])
                                    ]),
                                    isPrint ? createCommentVNode() : h('tr', [
                                        h('td', GlobalConfig.i18n('vxe.export.expType')),
                                        h('td', [
                                            h(VxeSelectConstructor, {
                                                modelValue: defaultOptions.type,
                                                options: storeData.typeList.map(function (item) {
                                                    return {
                                                        value: item.value,
                                                        label: GlobalConfig.i18n(item.label)
                                                    };
                                                }),
                                                'onUpdate:modelValue': function (value) {
                                                    defaultOptions.type = value;
                                                }
                                            })
                                        ])
                                    ]),
                                    isPrint || showSheet ? h('tr', [
                                        h('td', GlobalConfig.i18n('vxe.export.expSheetName')),
                                        h('td', [
                                            h(VxeInputConstructor, {
                                                ref: xInputSheetname,
                                                modelValue: defaultOptions.sheetName,
                                                type: 'text',
                                                clearable: true,
                                                placeholder: GlobalConfig.i18n('vxe.export.expSheetNamePlaceholder'),
                                                'onUpdate:modelValue': function (value) {
                                                    defaultOptions.sheetName = value;
                                                }
                                            })
                                        ])
                                    ]) : createCommentVNode(),
                                    h('tr', [
                                        h('td', GlobalConfig.i18n('vxe.export.expMode')),
                                        h('td', [
                                            h(VxeSelectConstructor, {
                                                modelValue: defaultOptions.mode,
                                                options: storeData.modeList.map(function (item) {
                                                    return {
                                                        value: item.value,
                                                        label: GlobalConfig.i18n(item.label)
                                                    };
                                                }),
                                                'onUpdate:modelValue': function (value) {
                                                    defaultOptions.mode = value;
                                                }
                                            })
                                        ])
                                    ]),
                                    h('tr', [
                                        h('td', [GlobalConfig.i18n('vxe.export.expColumn')]),
                                        h('td', [
                                            h('div', {
                                                class: 'vxe-export--panel-column'
                                            }, [
                                                h('ul', {
                                                    class: 'vxe-export--panel-column-header'
                                                }, [
                                                    h('li', {
                                                        class: ['vxe-export--panel-column-option', {
                                                                'is--checked': isAll,
                                                                'is--indeterminate': isIndeterminate
                                                            }],
                                                        title: GlobalConfig.i18n('vxe.table.allTitle'),
                                                        onClick: allColumnEvent
                                                    }, [
                                                        h('span', {
                                                            class: 'vxe-checkbox--icon vxe-checkbox--checked-icon'
                                                        }),
                                                        h('span', {
                                                            class: 'vxe-checkbox--icon vxe-checkbox--unchecked-icon'
                                                        }),
                                                        h('span', {
                                                            class: 'vxe-checkbox--icon vxe-checkbox--indeterminate-icon'
                                                        }),
                                                        h('span', {
                                                            class: 'vxe-checkbox--label'
                                                        }, GlobalConfig.i18n('vxe.export.expCurrentColumn'))
                                                    ])
                                                ]),
                                                h('ul', {
                                                    class: 'vxe-export--panel-column-body'
                                                }, cols)
                                            ])
                                        ])
                                    ]),
                                    h('tr', [
                                        h('td', GlobalConfig.i18n('vxe.export.expOpts')),
                                        h('td', [
                                            h('div', {
                                                class: 'vxe-export--panel-option-row'
                                            }, [
                                                h(VxeCheckboxConstructor, {
                                                    modelValue: defaultOptions.isHeader,
                                                    title: GlobalConfig.i18n('vxe.export.expHeaderTitle'),
                                                    content: GlobalConfig.i18n('vxe.export.expOptHeader'),
                                                    'onUpdate:modelValue': function (value) {
                                                        defaultOptions.isHeader = value;
                                                    }
                                                }),
                                                h(VxeCheckboxConstructor, {
                                                    modelValue: defaultOptions.isFooter,
                                                    disabled: !storeData.hasFooter,
                                                    title: GlobalConfig.i18n('vxe.export.expFooterTitle'),
                                                    content: GlobalConfig.i18n('vxe.export.expOptFooter'),
                                                    'onUpdate:modelValue': function (value) {
                                                        defaultOptions.isFooter = value;
                                                    }
                                                }),
                                                h(VxeCheckboxConstructor, {
                                                    modelValue: defaultOptions.original,
                                                    title: GlobalConfig.i18n('vxe.export.expOriginalTitle'),
                                                    content: GlobalConfig.i18n('vxe.export.expOptOriginal'),
                                                    'onUpdate:modelValue': function (value) {
                                                        defaultOptions.original = value;
                                                    }
                                                })
                                            ]),
                                            h('div', {
                                                class: 'vxe-export--panel-option-row'
                                            }, [
                                                h(VxeCheckboxConstructor, {
                                                    modelValue: isHeader && hasColgroup && supportMerge ? defaultOptions.isColgroup : false,
                                                    title: GlobalConfig.i18n('vxe.export.expColgroupTitle'),
                                                    disabled: !isHeader || !hasColgroup || !supportMerge,
                                                    content: GlobalConfig.i18n('vxe.export.expOptColgroup'),
                                                    'onUpdate:modelValue': function (value) {
                                                        defaultOptions.isColgroup = value;
                                                    }
                                                }),
                                                h(VxeCheckboxConstructor, {
                                                    modelValue: hasMerge && supportMerge && checkedAll ? defaultOptions.isMerge : false,
                                                    title: GlobalConfig.i18n('vxe.export.expMergeTitle'),
                                                    disabled: !hasMerge || !supportMerge || !checkedAll,
                                                    content: GlobalConfig.i18n('vxe.export.expOptMerge'),
                                                    'onUpdate:modelValue': function (value) {
                                                        defaultOptions.isMerge = value;
                                                    }
                                                }),
                                                isPrint ? createCommentVNode() : h(VxeCheckboxConstructor, {
                                                    modelValue: supportStyle ? defaultOptions.useStyle : false,
                                                    disabled: !supportStyle,
                                                    title: GlobalConfig.i18n('vxe.export.expUseStyleTitle'),
                                                    content: GlobalConfig.i18n('vxe.export.expOptUseStyle'),
                                                    'onUpdate:modelValue': function (value) {
                                                        defaultOptions.useStyle = value;
                                                    }
                                                }),
                                                h(VxeCheckboxConstructor, {
                                                    modelValue: hasTree ? defaultOptions.isAllExpand : false,
                                                    disabled: !hasTree,
                                                    title: GlobalConfig.i18n('vxe.export.expAllExpandTitle'),
                                                    content: GlobalConfig.i18n('vxe.export.expOptAllExpand'),
                                                    'onUpdate:modelValue': function (value) {
                                                        defaultOptions.isAllExpand = value;
                                                    }
                                                })
                                            ])
                                        ])
                                    ])
                                ]
                            ])
                        ]),
                        h('div', {
                            class: 'vxe-export--panel-btns'
                        }, [
                            h(VxeButtonConstructor, {
                                content: GlobalConfig.i18n('vxe.export.expCancel'),
                                onClick: cancelEvent
                            }),
                            h(VxeButtonConstructor, {
                                ref: xButtonConfirm,
                                status: 'primary',
                                content: GlobalConfig.i18n(isPrint ? 'vxe.export.expPrint' : 'vxe.export.expConfirm'),
                                onClick: confirmEvent
                            })
                        ])
                    ]);
                }
            });
        };
        return renderVN;
    }
});
