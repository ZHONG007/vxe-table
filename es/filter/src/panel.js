import { defineComponent, h, computed, inject } from 'vue';
import GlobalConfig from '../../v-x-e-table/src/conf';
import { VXETable } from '../../v-x-e-table';
import { formatText } from '../../tools/utils';
export default defineComponent({
    name: 'VxeTableFilter',
    props: {
        filterStore: Object
    },
    setup: function (props) {
        var $xetable = inject('$xetable', {});
        var tableReactData = $xetable.reactData, tableInternalData = $xetable.internalData;
        var computeHasCheckOption = computed(function () {
            var filterStore = props.filterStore;
            return filterStore && filterStore.options.some(function (option) { return option.checked; });
        });
        // 全部筛选事件
        var filterCheckAllEvent = function (evnt, value) {
            var filterStore = props.filterStore;
            filterStore.options.forEach(function (option) {
                option._checked = value;
                option.checked = value;
            });
            filterStore.isAllSelected = value;
            filterStore.isIndeterminate = false;
        };
        /*************************
         * Publish methods
         *************************/
        // 确认筛选
        var confirmFilter = function (evnt) {
            var filterStore = props.filterStore;
            filterStore.options.forEach(function (option) {
                option.checked = option._checked;
            });
            $xetable.confirmFilterEvent(evnt);
        };
        // （单选）筛选发生改变
        var changeRadioOption = function (evnt, checked, item) {
            var filterStore = props.filterStore;
            filterStore.options.forEach(function (option) {
                option._checked = false;
            });
            item._checked = checked;
            $xetable.checkFilterOptions();
            confirmFilter(evnt);
        };
        /**
         * 重置筛选
         * 当筛选面板中的重置按钮被按下时触发
         * @param {Event} evnt 事件
         */
        var resetFilter = function (evnt) {
            var filterStore = props.filterStore;
            $xetable.handleClearFilter(filterStore.column);
            $xetable.confirmFilterEvent(evnt);
        };
        // （多选）筛选发生改变
        var changeMultipleOption = function (evnt, checked, item) {
            item._checked = checked;
            $xetable.checkFilterOptions();
        };
        // 筛选发生改变
        var changeOption = function (evnt, checked, item) {
            var filterStore = props.filterStore;
            if (filterStore.multiple) {
                changeMultipleOption(evnt, checked, item);
            }
            else {
                changeRadioOption(evnt, checked, item);
            }
        };
        var changeAllOption = function (evnt, checked) {
            var filterStore = props.filterStore;
            if (filterStore.multiple) {
                filterCheckAllEvent(evnt, checked);
            }
            else {
                resetFilter(evnt);
            }
        };
        /*************************
         * Publish methods
         *************************/
        var $panel = {
            changeRadioOption: changeRadioOption,
            changeMultipleOption: changeMultipleOption,
            changeAllOption: changeAllOption,
            changeOption: changeOption,
            confirmFilter: confirmFilter,
            resetFilter: resetFilter
        };
        var renderOptions = function (filterRender, compConf) {
            var filterStore = props.filterStore;
            var column = filterStore.column, multiple = filterStore.multiple, maxHeight = filterStore.maxHeight;
            var slots = column.slots;
            var filterSlot = slots ? slots.filter : null;
            var params = Object.assign({}, tableInternalData._currFilterParams, { $panel: $panel, $table: $xetable });
            if (filterSlot) {
                return [
                    h('div', {
                        class: 'vxe-table--filter-template'
                    }, $xetable.callSlot(filterSlot, params))
                ];
            }
            else if (compConf && compConf.renderFilter) {
                return [
                    h('div', {
                        class: 'vxe-table--filter-template'
                    }, compConf.renderFilter(filterRender, params))
                ];
            }
            return [
                h('ul', {
                    class: 'vxe-table--filter-header'
                }, [
                    h('li', {
                        class: ['vxe-table--filter-option', {
                                'is--checked': multiple ? filterStore.isAllSelected : !filterStore.options.some(function (item) { return item._checked; }),
                                'is--indeterminate': multiple && filterStore.isIndeterminate
                            }],
                        title: GlobalConfig.i18n(multiple ? 'vxe.table.allTitle' : 'vxe.table.allFilter'),
                        onClick: function (evnt) {
                            changeAllOption(evnt, !filterStore.isAllSelected);
                        }
                    }, (multiple ? [
                        h('span', {
                            class: 'vxe-checkbox--icon vxe-checkbox--checked-icon'
                        }),
                        h('span', {
                            class: 'vxe-checkbox--icon vxe-checkbox--unchecked-icon'
                        }),
                        h('span', {
                            class: 'vxe-checkbox--icon vxe-checkbox--indeterminate-icon'
                        })
                    ] : []).concat([
                        h('span', {
                            class: 'vxe-checkbox--label'
                        }, GlobalConfig.i18n('vxe.table.allFilter'))
                    ]))
                ]),
                h('ul', {
                    class: 'vxe-table--filter-body',
                    style: maxHeight ? {
                        maxHeight: maxHeight + "px"
                    } : {}
                }, filterStore.options.map(function (item) {
                    return h('li', {
                        class: ['vxe-table--filter-option', {
                                'is--checked': item._checked
                            }],
                        title: item.label,
                        onClick: function (evnt) {
                            changeOption(evnt, !item._checked, item);
                        }
                    }, (multiple ? [
                        h('span', {
                            class: 'vxe-checkbox--icon vxe-checkbox--checked-icon'
                        }),
                        h('span', {
                            class: 'vxe-checkbox--icon vxe-checkbox--unchecked-icon'
                        }),
                        h('span', {
                            class: 'vxe-checkbox--icon vxe-checkbox--indeterminate-icon'
                        })
                    ] : []).concat([
                        h('span', {
                            class: 'vxe-checkbox--label'
                        }, formatText(item.label, 1))
                    ]));
                }))
            ];
        };
        var renderFooters = function () {
            var filterStore = props.filterStore;
            var column = filterStore.column, multiple = filterStore.multiple;
            var hasCheckOption = computeHasCheckOption.value;
            var filterRender = column.filterRender;
            var compConf = filterRender ? VXETable.renderer.get(filterRender.name) : null;
            var isDisabled = !hasCheckOption && !filterStore.isAllSelected && !filterStore.isIndeterminate;
            return multiple && (!compConf || compConf.showFilterFooter !== false) ? [
                h('div', {
                    class: 'vxe-table--filter-footer'
                }, [
                    h('button', {
                        class: {
                            'is--disabled': isDisabled
                        },
                        disabled: isDisabled,
                        onClick: confirmFilter
                    }, GlobalConfig.i18n('vxe.table.confirmFilter')),
                    h('button', {
                        onClick: resetFilter
                    }, GlobalConfig.i18n('vxe.table.resetFilter'))
                ])
            ] : [];
        };
        var renderVN = function () {
            var filterStore = props.filterStore;
            var initStore = tableReactData.initStore;
            var column = filterStore.column;
            var filterRender = column ? column.filterRender : null;
            var compConf = filterRender ? VXETable.renderer.get(filterRender.name) : null;
            return h('div', {
                class: ['vxe-table--filter-wrapper', 'filter--prevent-default', compConf && compConf.className ? compConf.className : '', {
                        'is--animat': $xetable.props.animat,
                        'is--multiple': filterStore.multiple,
                        'is--active': filterStore.visible
                    }],
                style: filterStore.style
            }, initStore.filter && filterStore.visible ? renderOptions(filterRender, compConf).concat(renderFooters()) : []);
        };
        return renderVN;
    }
});
