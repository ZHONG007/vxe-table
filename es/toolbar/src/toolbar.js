var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { defineComponent, h, ref, computed, inject, createCommentVNode, resolveComponent, reactive, nextTick, onMounted, onUnmounted } from 'vue';
import XEUtils from 'xe-utils';
import GlobalConfig from '../../v-x-e-table/src/conf';
import { VXETable } from '../../v-x-e-table';
import { useSize } from '../../hooks/size';
import { getEventTargetNode } from '../../tools/dom';
import { warnLog, errLog, formatText } from '../../tools/utils';
import { GlobalEvent } from '../../tools/event';
export default defineComponent({
    name: 'VxeToolbar',
    props: {
        loading: Boolean,
        refresh: [Boolean, Object],
        import: [Boolean, Object],
        export: [Boolean, Object],
        print: [Boolean, Object],
        zoom: [Boolean, Object],
        custom: [Boolean, Object],
        buttons: { type: Array, default: function () { return GlobalConfig.toolbar.buttons; } },
        tools: { type: Array, default: function () { return GlobalConfig.toolbar.tools; } },
        perfect: { type: Boolean, default: function () { return GlobalConfig.toolbar.perfect; } },
        size: { type: String, default: function () { return GlobalConfig.toolbar.size || GlobalConfig.size; } },
        className: [String, Function]
    },
    emits: [
        'button-click',
        'tool-click'
    ],
    setup: function (props, context) {
        var slots = context.slots, emit = context.emit;
        var xID = XEUtils.uniqueId();
        var computeSize = useSize(props);
        var reactData = reactive({
            isRefresh: false,
            columns: []
        });
        var refElem = ref();
        var refCustomWrapper = ref();
        var customStore = reactive({
            isAll: false,
            isIndeterminate: false,
            activeBtn: false,
            activeWrapper: false,
            visible: false
        });
        var refMaps = {
            refElem: refElem
        };
        var $xetoolbar = {
            xID: xID,
            props: props,
            context: context,
            reactData: reactData,
            getRefMaps: function () { return refMaps; }
        };
        var toolbarMethods = {};
        var $xegrid = inject('$xegrid', null);
        var $xetable;
        var computeRefreshOpts = computed(function () {
            return Object.assign({}, GlobalConfig.toolbar.refresh, props.refresh);
        });
        var computeImportOpts = computed(function () {
            return Object.assign({}, GlobalConfig.toolbar.import, props.import);
        });
        var computeExportOpts = computed(function () {
            return Object.assign({}, GlobalConfig.toolbar.export, props.export);
        });
        var computePrintOpts = computed(function () {
            return Object.assign({}, GlobalConfig.toolbar.print, props.print);
        });
        var computeZoomOpts = computed(function () {
            return Object.assign({}, GlobalConfig.toolbar.zoom, props.zoom);
        });
        var computeCustomOpts = computed(function () {
            return Object.assign({}, GlobalConfig.toolbar.custom, props.custom);
        });
        var checkTable = function () {
            if ($xetable) {
                return true;
            }
            errLog('vxe.error.barUnableLink');
        };
        var checkCustomStatus = function () {
            var columns = reactData.columns;
            var computeTableCustomOpts = $xetable.getComputeMaps().computeCustomOpts;
            var tableCustomOpts = computeTableCustomOpts.value;
            var checkMethod = tableCustomOpts.checkMethod;
            customStore.isAll = columns.every(function (column) { return (checkMethod ? !checkMethod({ column: column }) : false) || column.visible; });
            customStore.isIndeterminate = !customStore.isAll && columns.some(function (column) { return (!checkMethod || checkMethod({ column: column })) && (column.visible || column.halfVisible); });
        };
        var showCustom = function () {
            customStore.visible = true;
            checkCustomStatus();
        };
        var handleTableCustom = function () {
            $xetable.handleCustom();
        };
        var closeCustom = function () {
            var custom = props.custom;
            var customOpts = computeCustomOpts.value;
            if (customStore.visible) {
                customStore.visible = false;
                if (custom && !customOpts.immediate) {
                    handleTableCustom();
                }
            }
        };
        var emitCustomEvent = function (type, evnt) {
            var comp = $xegrid || $xetable;
            comp.dispatchEvent('custom', { type: type }, evnt);
        };
        var confirmCustomEvent = function (evnt) {
            closeCustom();
            emitCustomEvent('confirm', evnt);
        };
        var customOpenEvent = function (evnt) {
            if (checkTable()) {
                if (!customStore.visible) {
                    showCustom();
                    emitCustomEvent('open', evnt);
                }
            }
        };
        var customColseEvent = function (evnt) {
            if (customStore.visible) {
                closeCustom();
                emitCustomEvent('close', evnt);
            }
        };
        var resetCustomEvent = function (evnt) {
            var columns = reactData.columns;
            var computeTableCustomOpts = $xetable.getComputeMaps().computeCustomOpts;
            var tableCustomOpts = computeTableCustomOpts.value;
            var checkMethod = tableCustomOpts.checkMethod;
            XEUtils.eachTree(columns, function (column) {
                if (!checkMethod || checkMethod({ column: column })) {
                    column.visible = column.defaultVisible;
                    column.halfVisible = false;
                }
                column.resizeWidth = 0;
            });
            $xetable.saveCustomResizable(true);
            closeCustom();
            emitCustomEvent('reset', evnt);
        };
        var handleOptionCheck = function (column) {
            var columns = reactData.columns;
            var matchObj = XEUtils.findTree(columns, function (item) { return item === column; });
            if (matchObj && matchObj.parent) {
                var parent_1 = matchObj.parent;
                if (parent_1.children && parent_1.children.length) {
                    parent_1.visible = parent_1.children.every(function (column) { return column.visible; });
                    parent_1.halfVisible = !parent_1.visible && parent_1.children.some(function (column) { return column.visible || column.halfVisible; });
                    handleOptionCheck(parent_1);
                }
            }
        };
        var changeCustomOption = function (column) {
            var isChecked = !column.visible;
            var customOpts = computeCustomOpts.value;
            XEUtils.eachTree([column], function (item) {
                item.visible = isChecked;
                item.halfVisible = false;
            });
            handleOptionCheck(column);
            if (props.custom && customOpts.immediate) {
                handleTableCustom();
            }
            checkCustomStatus();
        };
        var allCustomEvent = function () {
            var columns = reactData.columns;
            var computeTableCustomOpts = $xetable.getComputeMaps().computeCustomOpts;
            var tableCustomOpts = computeTableCustomOpts.value;
            var checkMethod = tableCustomOpts.checkMethod;
            var isAll = !customStore.isAll;
            XEUtils.eachTree(columns, function (column) {
                if (!checkMethod || checkMethod({ column: column })) {
                    column.visible = isAll;
                    column.halfVisible = false;
                }
            });
            customStore.isAll = isAll;
            checkCustomStatus();
        };
        var handleGlobalMousedownEvent = function (evnt) {
            var customWrapperElem = refCustomWrapper.value;
            if (!getEventTargetNode(evnt, customWrapperElem).flag) {
                customColseEvent(evnt);
            }
        };
        var handleGlobalBlurEvent = function (evnt) {
            customColseEvent(evnt);
        };
        var handleClickSettingEvent = function (evnt) {
            if (customStore.visible) {
                customColseEvent(evnt);
            }
            else {
                customOpenEvent(evnt);
            }
        };
        var handleMouseenterSettingEvent = function (evnt) {
            customStore.activeBtn = true;
            customOpenEvent(evnt);
        };
        var handleMouseleaveSettingEvent = function (evnt) {
            customStore.activeBtn = false;
            setTimeout(function () {
                if (!customStore.activeBtn && !customStore.activeWrapper) {
                    customColseEvent(evnt);
                }
            }, 300);
        };
        var handleWrapperMouseenterEvent = function (evnt) {
            customStore.activeWrapper = true;
            customOpenEvent(evnt);
        };
        var handleWrapperMouseleaveEvent = function (evnt) {
            customStore.activeWrapper = false;
            setTimeout(function () {
                if (!customStore.activeBtn && !customStore.activeWrapper) {
                    customColseEvent(evnt);
                }
            }, 300);
        };
        var refreshEvent = function () {
            var isRefresh = reactData.isRefresh;
            var refreshOpts = computeRefreshOpts.value;
            if (!isRefresh) {
                var query = refreshOpts.query;
                if (query) {
                    reactData.isRefresh = true;
                    try {
                        Promise.resolve(query({})).catch(function (e) { return e; }).then(function () {
                            reactData.isRefresh = false;
                        });
                    }
                    catch (e) {
                        reactData.isRefresh = false;
                    }
                }
                else if ($xegrid) {
                    reactData.isRefresh = true;
                    $xegrid.commitProxy('reload').catch(function (e) { return e; }).then(function () {
                        reactData.isRefresh = false;
                    });
                }
            }
        };
        var zoomEvent = function (evnt) {
            if ($xegrid) {
                $xegrid.triggerZoomEvent(evnt);
            }
        };
        var btnEvent = function (evnt, item) {
            var code = item.code;
            if (code) {
                if ($xegrid) {
                    $xegrid.triggerToolbarBtnEvent(item, evnt);
                }
                else {
                    var commandMethod = VXETable.commands.get(code);
                    var params = { code: code, button: item, $table: $xetable, $event: evnt };
                    if (commandMethod) {
                        commandMethod(params, evnt);
                    }
                    $xetoolbar.dispatchEvent('button-click', params, evnt);
                }
            }
        };
        var tolEvent = function (evnt, item) {
            var code = item.code;
            if (code) {
                if ($xegrid) {
                    $xegrid.triggerToolbarTolEvent(item, evnt);
                }
                else {
                    var commandMethod = VXETable.commands.get(code);
                    var params = { code: code, tool: item, $table: $xetable, $event: evnt };
                    if (commandMethod) {
                        commandMethod(params, evnt);
                    }
                    $xetoolbar.dispatchEvent('tool-click', params, evnt);
                }
            }
        };
        var importEvent = function () {
            if (checkTable()) {
                $xetable.openImport();
            }
        };
        var exportEvent = function () {
            if (checkTable()) {
                $xetable.openExport();
            }
        };
        var printEvent = function () {
            if (checkTable()) {
                $xetable.openPrint();
            }
        };
        var renderDropdowns = function (item, isBtn) {
            var dropdowns = item.dropdowns;
            var downVNs = [];
            if (dropdowns) {
                return dropdowns.map(function (child, index) {
                    if (child.visible === false) {
                        return createCommentVNode();
                    }
                    return h(resolveComponent('vxe-button'), {
                        key: index,
                        disabled: child.disabled,
                        loading: child.loading,
                        type: child.type,
                        icon: child.icon,
                        circle: child.circle,
                        round: child.round,
                        status: child.status,
                        content: child.name,
                        onClick: function (evnt) { return isBtn ? btnEvent(evnt, child) : tolEvent(evnt, child); }
                    });
                });
            }
            return downVNs;
        };
        /**
         * ????????????
         */
        var renderBtns = function () {
            var buttons = props.buttons;
            var buttonsSlot = slots.buttons;
            if (buttonsSlot) {
                return buttonsSlot({ $grid: $xegrid, $table: $xetable });
            }
            var btnVNs = [];
            if (buttons) {
                buttons.forEach(function (item) {
                    var dropdowns = item.dropdowns, buttonRender = item.buttonRender;
                    if (item.visible !== false) {
                        var compConf = buttonRender ? VXETable.renderer.get(buttonRender.name) : null;
                        if (buttonRender && compConf && compConf.renderToolbarButton) {
                            btnVNs.push(h('span', {
                                class: 'vxe-button--item'
                            }, compConf.renderToolbarButton(buttonRender, { $grid: $xegrid, $table: $xetable, button: item })));
                        }
                        else {
                            btnVNs.push(h(resolveComponent('vxe-button'), {
                                disabled: item.disabled,
                                loading: item.loading,
                                type: item.type,
                                icon: item.icon,
                                circle: item.circle,
                                round: item.round,
                                status: item.status,
                                content: item.name,
                                destroyOnClose: item.destroyOnClose,
                                placement: item.placement,
                                transfer: item.transfer,
                                onClick: function (evnt) { return btnEvent(evnt, item); }
                            }, dropdowns && dropdowns.length ? {
                                dropdowns: function () { return renderDropdowns(item, true); }
                            } : {}));
                        }
                    }
                });
            }
            return btnVNs;
        };
        /**
         * ??????????????????
         */
        var renderRightTools = function () {
            var tools = props.tools;
            var toolsSlot = slots.tools;
            if (toolsSlot) {
                return toolsSlot({ $grid: $xegrid, $table: $xetable });
            }
            var btnVNs = [];
            if (tools) {
                tools.forEach(function (item) {
                    var dropdowns = item.dropdowns, toolRender = item.toolRender;
                    if (item.visible !== false) {
                        var compConf = toolRender ? VXETable.renderer.get(toolRender.name) : null;
                        if (toolRender && compConf && compConf.renderToolbarTool) {
                            btnVNs.push(h('span', {
                                class: 'vxe-tool--item'
                            }, compConf.renderToolbarTool(toolRender, { $grid: $xegrid, $table: $xetable, tool: item })));
                        }
                        else {
                            btnVNs.push(h(resolveComponent('vxe-button'), {
                                disabled: item.disabled,
                                loading: item.loading,
                                type: item.type,
                                icon: item.icon,
                                circle: item.circle,
                                round: item.round,
                                status: item.status,
                                content: item.name,
                                destroyOnClose: item.destroyOnClose,
                                placement: item.placement,
                                transfer: item.transfer,
                                onClick: function (evnt) { return tolEvent(evnt, item); }
                            }, dropdowns && dropdowns.length ? {
                                dropdowns: function () { return renderDropdowns(item, false); }
                            } : {}));
                        }
                    }
                });
            }
            return btnVNs;
        };
        var renderCustoms = function () {
            var columns = reactData.columns;
            var customOpts = computeCustomOpts.value;
            var colVNs = [];
            var customBtnOns = {};
            var customWrapperOns = {};
            var checkMethod;
            if ($xetable) {
                var computeTableCustomOpts = $xetable.getComputeMaps().computeCustomOpts;
                var tableCustomOpts = computeTableCustomOpts.value;
                checkMethod = tableCustomOpts.checkMethod;
            }
            if (customOpts.trigger === 'manual') {
                // ????????????
            }
            else if (customOpts.trigger === 'hover') {
                // hover ??????
                customBtnOns.onMouseenter = handleMouseenterSettingEvent;
                customBtnOns.onMouseleave = handleMouseleaveSettingEvent;
                customWrapperOns.onMouseenter = handleWrapperMouseenterEvent;
                customWrapperOns.onMouseleave = handleWrapperMouseleaveEvent;
            }
            else {
                // ????????????
                customBtnOns.onClick = handleClickSettingEvent;
            }
            XEUtils.eachTree(columns, function (column) {
                var colTitle = formatText(column.getTitle(), 1);
                var colKey = column.getKey();
                var isColGroup = column.children && column.children.length;
                var isDisabled = checkMethod ? !checkMethod({ column: column }) : false;
                if (isColGroup || colKey) {
                    colVNs.push(h('li', {
                        class: ['vxe-custom--option', "level--" + column.level, {
                                'is--group': isColGroup,
                                'is--checked': column.visible,
                                'is--indeterminate': column.halfVisible,
                                'is--disabled': isDisabled
                            }],
                        title: colTitle,
                        onClick: function () {
                            if (!isDisabled) {
                                changeCustomOption(column);
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
                }
            });
            return h('div', {
                class: ['vxe-custom--wrapper', {
                        'is--active': customStore.visible
                    }],
                ref: refCustomWrapper
            }, [
                h(resolveComponent('vxe-button'), __assign({ circle: true, icon: customOpts.icon || GlobalConfig.icon.TOOLBAR_TOOLS_CUSTOM, title: GlobalConfig.i18n('vxe.toolbar.custom') }, customBtnOns)),
                h('div', {
                    class: 'vxe-custom--option-wrapper'
                }, [
                    h('ul', {
                        class: 'vxe-custom--header'
                    }, [
                        h('li', {
                            class: ['vxe-custom--option', {
                                    'is--checked': customStore.isAll,
                                    'is--indeterminate': customStore.isIndeterminate
                                }],
                            title: GlobalConfig.i18n('vxe.table.allTitle'),
                            onClick: allCustomEvent
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
                            }, GlobalConfig.i18n('vxe.toolbar.customAll'))
                        ])
                    ]),
                    h('ul', __assign({ class: 'vxe-custom--body' }, customWrapperOns), colVNs),
                    customOpts.isFooter === false ? null : h('div', {
                        class: 'vxe-custom--footer'
                    }, [
                        h('button', {
                            class: 'btn--confirm',
                            onClick: confirmCustomEvent
                        }, GlobalConfig.i18n('vxe.toolbar.customConfirm')),
                        h('button', {
                            class: 'btn--reset',
                            onClick: resetCustomEvent
                        }, GlobalConfig.i18n('vxe.toolbar.customRestore'))
                    ])
                ])
            ]);
        };
        toolbarMethods = {
            dispatchEvent: function (type, params, evnt) {
                emit(type, Object.assign({ $toolbar: $xetoolbar, $event: evnt }, params));
            },
            syncUpdate: function (params) {
                var collectColumn = params.collectColumn;
                $xetable = params.$table;
                reactData.columns = collectColumn;
            }
        };
        Object.assign($xetoolbar, toolbarMethods);
        onMounted(function () {
            GlobalEvent.on($xetoolbar, 'mousedown', handleGlobalMousedownEvent);
            GlobalEvent.on($xetoolbar, 'blur', handleGlobalBlurEvent);
        });
        onUnmounted(function () {
            GlobalEvent.off($xetoolbar, 'mousedown');
            GlobalEvent.off($xetoolbar, 'blur');
        });
        nextTick(function () {
            var refresh = props.refresh;
            var refreshOpts = computeRefreshOpts.value;
            if (refresh && !$xegrid && !refreshOpts.query) {
                warnLog('vxe.error.notFunc', ['query']);
            }
        });
        var renderVN = function () {
            var _a;
            var perfect = props.perfect, loading = props.loading, refresh = props.refresh, zoom = props.zoom, custom = props.custom, className = props.className;
            var vSize = computeSize.value;
            var refreshOpts = computeRefreshOpts.value;
            var importOpts = computeImportOpts.value;
            var exportOpts = computeExportOpts.value;
            var printOpts = computePrintOpts.value;
            var zoomOpts = computeZoomOpts.value;
            return h('div', {
                ref: refElem,
                class: ['vxe-toolbar', className ? (XEUtils.isFunction(className) ? className({ $toolbar: $xetoolbar }) : className) : '', (_a = {},
                        _a["size--" + vSize] = vSize,
                        _a['is--perfect'] = perfect,
                        _a['is--loading'] = loading,
                        _a)]
            }, [
                h('div', {
                    class: 'vxe-buttons--wrapper'
                }, renderBtns()),
                h('div', {
                    class: 'vxe-tools--wrapper'
                }, renderRightTools()),
                h('div', {
                    class: 'vxe-tools--operate'
                }, [
                    props.import ? h(resolveComponent('vxe-button'), {
                        circle: true,
                        icon: importOpts.icon || GlobalConfig.icon.TOOLBAR_TOOLS_IMPORT,
                        title: GlobalConfig.i18n('vxe.toolbar.import'),
                        onClick: importEvent
                    }) : createCommentVNode(),
                    props.export ? h(resolveComponent('vxe-button'), {
                        circle: true,
                        icon: exportOpts.icon || GlobalConfig.icon.TOOLBAR_TOOLS_EXPORT,
                        title: GlobalConfig.i18n('vxe.toolbar.export'),
                        onClick: exportEvent
                    }) : createCommentVNode(),
                    props.print ? h(resolveComponent('vxe-button'), {
                        circle: true,
                        icon: printOpts.icon || GlobalConfig.icon.TOOLBAR_TOOLS_PRINT,
                        title: GlobalConfig.i18n('vxe.toolbar.print'),
                        onClick: printEvent
                    }) : createCommentVNode(),
                    refresh ? h(resolveComponent('vxe-button'), {
                        circle: true,
                        icon: reactData.isRefresh ? (refreshOpts.iconLoading || GlobalConfig.icon.TOOLBAR_TOOLS_REFRESH_LOADING) : (refreshOpts.icon || GlobalConfig.icon.TOOLBAR_TOOLS_REFRESH),
                        title: GlobalConfig.i18n('vxe.toolbar.refresh'),
                        onClick: refreshEvent
                    }) : createCommentVNode(),
                    zoom && $xegrid ? h(resolveComponent('vxe-button'), {
                        circle: true,
                        icon: $xegrid.isMaximized() ? (zoomOpts.iconOut || GlobalConfig.icon.TOOLBAR_TOOLS_ZOOM_OUT) : (zoomOpts.iconIn || GlobalConfig.icon.TOOLBAR_TOOLS_ZOOM_IN),
                        title: GlobalConfig.i18n("vxe.toolbar.zoom" + ($xegrid.isMaximized() ? 'Out' : 'In')),
                        onClick: zoomEvent
                    }) : createCommentVNode(),
                    custom ? renderCustoms() : createCommentVNode()
                ])
            ]);
        };
        $xetoolbar.renderVN = renderVN;
        return $xetoolbar;
    },
    render: function () {
        return this.renderVN();
    }
});
