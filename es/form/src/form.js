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
import { defineComponent, h, ref, resolveComponent, createCommentVNode, provide, computed, reactive, watch, nextTick, onMounted } from 'vue';
import XEUtils from 'xe-utils';
import GlobalConfig from '../../v-x-e-table/src/conf';
import { VXETable } from '../../v-x-e-table';
import { errLog, getFuncText, isEnableConf, eqEmptyValue } from '../../tools/utils';
import { scrollToView } from '../../tools/dom';
import { createItem } from './util';
import { renderTitle } from './render';
import { useSize } from '../../hooks/size';
var Rule = /** @class */ (function () {
    function Rule(rule) {
        Object.assign(this, {
            $options: rule,
            required: rule.required,
            min: rule.min,
            max: rule.min,
            type: rule.type,
            pattern: rule.pattern,
            validator: rule.validator,
            trigger: rule.trigger,
            maxWidth: rule.maxWidth
        });
    }
    Object.defineProperty(Rule.prototype, "message", {
        get: function () {
            return getFuncText(this.$options.message);
        },
        enumerable: false,
        configurable: true
    });
    return Rule;
}());
var validErrorRuleValue = function (rule, val) {
    var type = rule.type, min = rule.min, max = rule.max, pattern = rule.pattern;
    var isNumType = type === 'number';
    var numVal = isNumType ? XEUtils.toNumber(val) : XEUtils.getSize(val);
    // 判断数值
    if (isNumType && isNaN(val)) {
        return true;
    }
    // 如果存在 min，判断最小值
    if (!XEUtils.eqNull(min) && numVal < XEUtils.toNumber(min)) {
        return true;
    }
    // 如果存在 max，判断最大值
    if (!XEUtils.eqNull(max) && numVal > XEUtils.toNumber(max)) {
        return true;
    }
    // 如果存在 pattern，正则校验
    if (pattern && !(XEUtils.isRegExp(pattern) ? pattern : new RegExp(pattern)).test(val)) {
        return true;
    }
    return false;
};
function getResetValue(value, resetValue) {
    if (XEUtils.isArray(value)) {
        resetValue = [];
    }
    return resetValue;
}
export default defineComponent({
    name: 'VxeForm',
    props: {
        collapseStatus: { type: Boolean, default: true },
        loading: Boolean,
        data: Object,
        size: { type: String, default: function () { return GlobalConfig.form.size || GlobalConfig.size; } },
        span: [String, Number],
        align: { type: String, default: function () { return GlobalConfig.form.align; } },
        titleAlign: { type: String, default: function () { return GlobalConfig.form.titleAlign; } },
        titleWidth: [String, Number],
        titleColon: { type: Boolean, default: function () { return GlobalConfig.form.titleColon; } },
        titleAsterisk: { type: Boolean, default: function () { return GlobalConfig.form.titleAsterisk; } },
        titleOverflow: { type: [Boolean, String], default: null },
        className: [String, Function],
        items: Array,
        rules: Object,
        preventSubmit: { type: Boolean, default: function () { return GlobalConfig.form.preventSubmit; } },
        validConfig: Object,
        tooltipConfig: Object,
        customLayout: { type: Boolean, default: function () { return GlobalConfig.form.customLayout; } }
    },
    emits: [
        'update:collapseStatus',
        'collapse',
        'toggle-collapse',
        'submit',
        'submit-invalid',
        'reset'
    ],
    setup: function (props, context) {
        var hasUseTooltip = VXETable.tooltip;
        var slots = context.slots, emit = context.emit;
        var xID = XEUtils.uniqueId();
        var computeSize = useSize(props);
        var reactData = reactive({
            collapseAll: props.collapseStatus,
            staticItems: [],
            formItems: []
        });
        var internalData = reactive({
            tooltipTimeout: null,
            tooltipActive: false,
            tooltipStore: {
                item: null,
                visible: false
            }
        });
        var refElem = ref();
        var refTooltip = ref();
        var formMethods = {};
        var computeValidOpts = computed(function () {
            return Object.assign({}, GlobalConfig.form.validConfig, props.validConfig);
        });
        var computeTooltipOpts = ref();
        var handleTooltipLeaveMethod = function () {
            var tooltipOpts = computeTooltipOpts.value;
            setTimeout(function () {
                if (!internalData.tooltipActive) {
                    formMethods.closeTooltip();
                }
            }, tooltipOpts.leaveDelay);
            return false;
        };
        computeTooltipOpts = computed(function () {
            var opts = Object.assign({ leaveDelay: 300 }, GlobalConfig.form.tooltipConfig, props.tooltipConfig);
            if (opts.enterable) {
                opts.leaveMethod = handleTooltipLeaveMethod;
            }
            return opts;
        });
        var refMaps = {
            refElem: refElem
        };
        var computeMaps = {
            computeSize: computeSize,
            computeValidOpts: computeValidOpts,
            computeTooltipOpts: computeTooltipOpts
        };
        var $xeform = {
            xID: xID,
            props: props,
            context: context,
            reactData: reactData,
            getRefMaps: function () { return refMaps; },
            getComputeMaps: function () { return computeMaps; }
        };
        var callSlot = function (slotFunc, params) {
            if (slotFunc) {
                if (XEUtils.isString(slotFunc)) {
                    slotFunc = slots[slotFunc] || null;
                }
                if (XEUtils.isFunction(slotFunc)) {
                    return slotFunc(params);
                }
            }
            return [];
        };
        var loadItem = function (list) {
            if (list.length) {
                if (process.env.NODE_ENV === 'development') {
                    list.forEach(function (item) {
                        if (item.slots) {
                            XEUtils.each(item.slots, function (func) {
                                if (!XEUtils.isFunction(func)) {
                                    if (!slots[func]) {
                                        errLog('vxe.error.notSlot', [func]);
                                    }
                                }
                            });
                        }
                    });
                }
                reactData.staticItems = XEUtils.mapTree(list, function (item) { return createItem($xeform, item); }, { children: 'children' });
            }
            return nextTick();
        };
        var getItems = function () {
            var itemList = [];
            XEUtils.eachTree(reactData.formItems, function (item) {
                itemList.push(item);
            }, { children: 'children' });
            return itemList;
        };
        var getCollapseStatus = function () {
            return reactData.collapseAll;
        };
        var toggleCollapse = function () {
            var status = !getCollapseStatus();
            reactData.collapseAll = status;
            emit('update:collapseStatus', status);
            return nextTick();
        };
        var toggleCollapseEvent = function (evnt) {
            toggleCollapse();
            var status = getCollapseStatus();
            formMethods.dispatchEvent('toggle-collapse', { status: status, collapse: status, data: props.data }, evnt);
            formMethods.dispatchEvent('collapse', { status: status, collapse: status, data: props.data }, evnt);
        };
        var clearValidate = function (field) {
            var itemList = getItems();
            if (field) {
                var item = itemList.find(function (item) { return item.field === field; });
                if (item) {
                    item.showError = false;
                }
            }
            else {
                itemList.forEach(function (item) {
                    item.showError = false;
                });
            }
            return nextTick();
        };
        var reset = function () {
            var data = props.data;
            var itemList = getItems();
            if (data) {
                itemList.forEach(function (item) {
                    var field = item.field, resetValue = item.resetValue, itemRender = item.itemRender;
                    if (isEnableConf(itemRender)) {
                        var compConf = VXETable.renderer.get(itemRender.name);
                        if (compConf && compConf.itemResetMethod) {
                            compConf.itemResetMethod({ data: data, property: field, item: item, $form: $xeform });
                        }
                        else if (field) {
                            XEUtils.set(data, field, resetValue === null ? getResetValue(XEUtils.get(data, field), undefined) : resetValue);
                        }
                    }
                });
            }
            return clearValidate();
        };
        var resetEvent = function (evnt) {
            evnt.preventDefault();
            reset();
            formMethods.dispatchEvent('reset', { data: props.data }, evnt);
        };
        var handleFocus = function (fields) {
            var itemList = getItems();
            var el = refElem.value;
            fields.some(function (property, index) {
                var item = itemList.find(function (item) { return item.field === property; });
                if (item && isEnableConf(item.itemRender)) {
                    var itemRender = item.itemRender;
                    var compConf = VXETable.renderer.get(itemRender.name);
                    var inputElem = null;
                    // 定位到第一个
                    if (!index) {
                        scrollToView(el.querySelector("." + item.id));
                    }
                    // 如果指定了聚焦 class
                    if (itemRender.autofocus) {
                        inputElem = el.querySelector("." + item.id + " " + itemRender.autofocus);
                    }
                    // 渲染器的聚焦处理
                    if (!inputElem && compConf && compConf.autofocus) {
                        inputElem = el.querySelector("." + item.id + " " + compConf.autofocus);
                    }
                    if (inputElem) {
                        inputElem.focus();
                        return true;
                    }
                }
            });
        };
        /**
         * 校验数据
         * 按表格行、列顺序依次校验（同步或异步）
         * 校验规则根据索引顺序依次校验，如果是异步则会等待校验完成才会继续校验下一列
         * 如果校验失败则，触发回调或者 Promise<(ErrMap 校验不通过列的信息)>
         * 如果是传回调方式这返回一个 (ErrMap 校验不通过列的信息)
         *
         * rule 配置：
         *  required=Boolean 是否必填
         *  min=Number 最小长度
         *  max=Number 最大长度
         *  validator=Function({ itemValue, rule, rules, data, property }) 自定义校验，接收一个 Promise
         *  trigger=change 触发方式
         */
        var validItemRules = function (validType, property, val) {
            var data = props.data, formRules = props.rules;
            var errorRules = [];
            var syncVailds = [];
            if (property && formRules) {
                var rules_1 = XEUtils.get(formRules, property);
                if (rules_1) {
                    var itemValue_1 = XEUtils.isUndefined(val) ? XEUtils.get(data, property) : val;
                    rules_1.forEach(function (rule) {
                        var type = rule.type, trigger = rule.trigger, required = rule.required;
                        if (validType === 'all' || !trigger || validType === trigger) {
                            if (XEUtils.isFunction(rule.validator)) {
                                var customValid = rule.validator({
                                    itemValue: itemValue_1,
                                    rule: rule,
                                    rules: rules_1,
                                    data: data,
                                    property: property,
                                    $form: $xeform
                                });
                                if (customValid) {
                                    if (XEUtils.isError(customValid)) {
                                        errorRules.push(new Rule({ type: 'custom', trigger: trigger, message: customValid.message, rule: new Rule(rule) }));
                                    }
                                    else if (customValid.catch) {
                                        // 如果为异步校验（注：异步校验是并发无序的）
                                        syncVailds.push(customValid.catch(function (e) {
                                            errorRules.push(new Rule({ type: 'custom', trigger: trigger, message: e ? e.message : rule.message, rule: new Rule(rule) }));
                                        }));
                                    }
                                }
                            }
                            else {
                                var isArrType = type === 'array';
                                var hasEmpty = isArrType ? (!XEUtils.isArray(itemValue_1) || !itemValue_1.length) : eqEmptyValue(itemValue_1);
                                if (required ? (hasEmpty || validErrorRuleValue(rule, itemValue_1)) : (!hasEmpty && validErrorRuleValue(rule, itemValue_1))) {
                                    errorRules.push(new Rule(rule));
                                }
                            }
                        }
                    });
                }
            }
            return Promise.all(syncVailds).then(function () {
                if (errorRules.length) {
                    var rest = { rules: errorRules, rule: errorRules[0] };
                    return Promise.reject(rest);
                }
            });
        };
        var showErrTime;
        var beginValidate = function (itemList, type, callback) {
            var data = props.data, formRules = props.rules;
            var validOpts = computeValidOpts.value;
            var validRest = {};
            var validFields = [];
            var itemValids = [];
            clearValidate();
            clearTimeout(showErrTime);
            if (data && formRules) {
                itemList.forEach(function (item) {
                    var field = item.field;
                    if (field) {
                        itemValids.push(validItemRules(type || 'all', field).then(function () {
                            item.errRule = null;
                        }).catch(function (_a) {
                            var rule = _a.rule, rules = _a.rules;
                            var rest = { rule: rule, rules: rules, data: data, property: field, $form: $xeform };
                            if (!validRest[field]) {
                                validRest[field] = [];
                            }
                            validRest[field].push(rest);
                            validFields.push(field);
                            item.errRule = rule;
                            return Promise.reject(rest);
                        }));
                    }
                });
                return Promise.all(itemValids).then(function () {
                    if (callback) {
                        callback();
                    }
                }).catch(function () {
                    return new Promise(function (resolve, reject) {
                        showErrTime = window.setTimeout(function () {
                            itemList.forEach(function (item) {
                                if (item.errRule) {
                                    item.showError = true;
                                }
                            });
                        }, 20);
                        if (validOpts.autoPos !== false) {
                            nextTick(function () {
                                handleFocus(validFields);
                            });
                        }
                        if (callback) {
                            callback(validRest);
                            resolve();
                        }
                        else {
                            reject(validRest);
                        }
                    });
                });
            }
            if (callback) {
                callback();
            }
            return Promise.resolve();
        };
        var validate = function (callback) {
            return beginValidate(getItems(), '', callback);
        };
        var validateField = function (field, callback) {
            return beginValidate(getItems().filter(function (item) { return item.field === field; }), '', callback);
        };
        var submitEvent = function (evnt) {
            evnt.preventDefault();
            if (!props.preventSubmit) {
                beginValidate(getItems()).then(function () {
                    formMethods.dispatchEvent('submit', { data: props.data }, evnt);
                }).catch(function (errMap) {
                    formMethods.dispatchEvent('submit-invalid', { data: props.data, errMap: errMap }, evnt);
                });
            }
        };
        var closeTooltip = function () {
            var tooltipStore = internalData.tooltipStore;
            var $tooltip = refTooltip.value;
            if (tooltipStore.visible) {
                Object.assign(tooltipStore, {
                    item: null,
                    visible: false
                });
                if ($tooltip) {
                    $tooltip.close();
                }
            }
            return nextTick();
        };
        var triggerHeaderHelpEvent = function (evnt, params) {
            var item = params.item;
            var tooltipStore = internalData.tooltipStore;
            var $tooltip = refTooltip.value;
            var overflowElem = evnt.currentTarget.children[0];
            var content = (overflowElem.textContent || '').trim();
            var isCellOverflow = overflowElem.scrollWidth > overflowElem.clientWidth;
            clearTimeout(internalData.tooltipTimeout);
            internalData.tooltipActive = true;
            closeTooltip();
            if (content && isCellOverflow) {
                Object.assign(tooltipStore, {
                    item: item,
                    visible: true
                });
                if ($tooltip) {
                    $tooltip.open(overflowElem, content);
                }
            }
        };
        var handleTargetLeaveEvent = function () {
            var tooltipOpts = computeTooltipOpts.value;
            internalData.tooltipActive = false;
            if (tooltipOpts.enterable) {
                internalData.tooltipTimeout = setTimeout(function () {
                    var $tooltip = refTooltip.value;
                    if ($tooltip && !$tooltip.reactData.isHover) {
                        closeTooltip();
                    }
                }, tooltipOpts.leaveDelay);
            }
            else {
                closeTooltip();
            }
        };
        /**
         * 更新项状态
         * 如果组件值 v-model 发生 change 时，调用改函数用于更新某一项编辑状态
         * 如果单元格配置了校验规则，则会进行校验
         */
        var updateStatus = function (scope, itemValue) {
            var property = scope.property;
            if (property) {
                validItemRules('change', property, itemValue)
                    .then(function () {
                    clearValidate(property);
                })
                    .catch(function (_a) {
                    var rule = _a.rule;
                    var itemList = getItems();
                    var item = itemList.find(function (item) { return item.field === property; });
                    if (item) {
                        item.showError = true;
                        item.errRule = rule;
                    }
                });
            }
        };
        var renderItems = function (itemList) {
            var data = props.data, rules = props.rules, allTitleOverflow = props.titleOverflow;
            var collapseAll = reactData.collapseAll;
            var validOpts = computeValidOpts.value;
            return itemList.map(function (item, index) {
                var slots = item.slots, title = item.title, visible = item.visible, folding = item.folding, visibleMethod = item.visibleMethod, field = item.field, collapseNode = item.collapseNode, itemRender = item.itemRender, showError = item.showError, errRule = item.errRule, className = item.className, titleOverflow = item.titleOverflow, children = item.children;
                var compConf = isEnableConf(itemRender) ? VXETable.renderer.get(itemRender.name) : null;
                var defaultSlot = slots ? slots.default : null;
                var titleSlot = slots ? slots.title : null;
                var span = item.span || props.span;
                var align = item.align || props.align;
                var titleAlign = item.titleAlign || props.titleAlign;
                var titleWidth = item.titleWidth || props.titleWidth;
                var itemOverflow = (XEUtils.isUndefined(titleOverflow) || XEUtils.isNull(titleOverflow)) ? allTitleOverflow : titleOverflow;
                var showEllipsis = itemOverflow === 'ellipsis';
                var showTitle = itemOverflow === 'title';
                var showTooltip = itemOverflow === true || itemOverflow === 'tooltip';
                var hasEllipsis = showTitle || showTooltip || showEllipsis;
                var itemVisibleMethod = visibleMethod;
                var params = { data: data, property: field, item: item, $form: $xeform };
                if (visible === false) {
                    return createCommentVNode();
                }
                var isRequired = false;
                if (rules) {
                    var itemRules = rules[field];
                    if (itemRules) {
                        isRequired = itemRules.some(function (rule) { return rule.required; });
                    }
                }
                // 如果为项集合
                var isGather = children && children.length > 0;
                if (isGather) {
                    var childVNs = renderItems(item.children);
                    return childVNs.length ? h('div', {
                        class: ['vxe-form--gather vxe-row', item.id, span ? "vxe-col--" + span + " is--span" : '', className ? (XEUtils.isFunction(className) ? className(params) : className) : '']
                    }, childVNs) : createCommentVNode();
                }
                if (!itemVisibleMethod && compConf && compConf.itemVisibleMethod) {
                    itemVisibleMethod = compConf.itemVisibleMethod;
                }
                var contentVNs = [];
                if (defaultSlot) {
                    contentVNs = callSlot(defaultSlot, params);
                }
                else if (compConf && compConf.renderItemContent) {
                    contentVNs = compConf.renderItemContent(itemRender, params);
                }
                else if (field) {
                    contentVNs = ["" + XEUtils.get(data, field)];
                }
                if (collapseNode) {
                    contentVNs.push(h('div', {
                        class: 'vxe-form--item-trigger-node',
                        onClick: toggleCollapseEvent
                    }, [
                        h('span', {
                            class: 'vxe-form--item-trigger-text'
                        }, collapseAll ? GlobalConfig.i18n('vxe.form.unfolding') : GlobalConfig.i18n('vxe.form.folding')),
                        h('i', {
                            class: ['vxe-form--item-trigger-icon', collapseAll ? GlobalConfig.icon.FORM_FOLDING : GlobalConfig.icon.FORM_UNFOLDING]
                        })
                    ]));
                }
                if (errRule && validOpts.showMessage) {
                    contentVNs.push(h('div', {
                        class: 'vxe-form--item-valid',
                        style: errRule.maxWidth ? {
                            width: errRule.maxWidth + "px"
                        } : null
                    }, errRule.message));
                }
                var ons = showTooltip ? {
                    onMouseenter: function (evnt) {
                        triggerHeaderHelpEvent(evnt, params);
                    },
                    onMouseleave: handleTargetLeaveEvent
                } : {};
                return h('div', {
                    class: ['vxe-form--item', item.id, span ? "vxe-col--" + span + " is--span" : '', className ? (XEUtils.isFunction(className) ? className(params) : className) : '', {
                            'is--title': title,
                            'is--required': isRequired,
                            'is--hidden': folding && collapseAll,
                            'is--active': !itemVisibleMethod || itemVisibleMethod(params),
                            'is--error': showError
                        }],
                    key: index
                }, [
                    h('div', {
                        class: 'vxe-form--item-inner'
                    }, [
                        title || titleSlot ? h('div', __assign({ class: ['vxe-form--item-title', titleAlign ? "align--" + titleAlign : null, {
                                    'is--ellipsis': hasEllipsis
                                }], style: titleWidth ? {
                                width: isNaN(titleWidth) ? titleWidth : titleWidth + "px"
                            } : null, title: showTitle ? getFuncText(title) : null }, ons), renderTitle($xeform, item)) : null,
                        h('div', {
                            class: ['vxe-form--item-content', align ? "align--" + align : null]
                        }, contentVNs)
                    ])
                ]);
            });
        };
        formMethods = {
            dispatchEvent: function (type, params, evnt) {
                emit(type, Object.assign({ $form: $xeform, $event: evnt }, params));
            },
            reset: reset,
            validate: validate,
            validateField: validateField,
            clearValidate: clearValidate,
            updateStatus: updateStatus,
            toggleCollapse: toggleCollapse,
            getItems: getItems,
            closeTooltip: closeTooltip
        };
        var formPrivateMethods = {
            callSlot: callSlot,
            toggleCollapseEvent: toggleCollapseEvent,
            triggerHeaderHelpEvent: triggerHeaderHelpEvent,
            handleTargetLeaveEvent: handleTargetLeaveEvent
        };
        Object.assign($xeform, formMethods, formPrivateMethods);
        watch(function () { return reactData.staticItems; }, function (value) {
            reactData.formItems = value;
        });
        watch(function () { return props.items; }, function (value) {
            loadItem(value || []);
        });
        watch(function () { return props.collapseStatus; }, function (value) {
            reactData.collapseAll = !!value;
        });
        onMounted(function () {
            nextTick(function () {
                if (process.env.NODE_ENV === 'development') {
                    if (props.customLayout && props.items) {
                        errLog('vxe.error.errConflicts', ['custom-layout', 'items']);
                    }
                }
                loadItem(props.items || []);
            });
        });
        var renderVN = function () {
            var _a;
            var loading = props.loading, className = props.className, data = props.data, titleColon = props.titleColon, titleAsterisk = props.titleAsterisk, customLayout = props.customLayout;
            var formItems = reactData.formItems;
            var vSize = computeSize.value;
            var tooltipOpts = computeTooltipOpts.value;
            var defaultSlot = slots.default;
            return h('form', {
                ref: refElem,
                class: ['vxe-form', className ? (XEUtils.isFunction(className) ? className({ items: formItems, data: data, $form: $xeform }) : className) : '', (_a = {},
                        _a["size--" + vSize] = vSize,
                        _a['is--colon'] = titleColon,
                        _a['is--asterisk'] = titleAsterisk,
                        _a['is--loading'] = loading,
                        _a)],
                onSubmit: submitEvent,
                onReset: resetEvent
            }, [
                h('div', {
                    class: 'vxe-form--wrapper vxe-row'
                }, customLayout ? (defaultSlot ? defaultSlot({}) : []) : renderItems(formItems)),
                h('div', {
                    class: 'vxe-form-slots',
                    ref: 'hideItem'
                }, customLayout ? [] : (defaultSlot ? defaultSlot({}) : [])),
                h('div', {
                    class: ['vxe-loading', {
                            'is--visible': loading
                        }]
                }, [
                    h('div', {
                        class: 'vxe-loading--spinner'
                    })
                ]),
                /**
                 * 工具提示
                 */
                hasUseTooltip ? h(resolveComponent('vxe-tooltip'), __assign({ ref: refTooltip }, tooltipOpts)) : createCommentVNode()
            ]);
        };
        $xeform.renderVN = renderVN;
        provide('$xeform', $xeform);
        return $xeform;
    },
    render: function () {
        return this.renderVN();
    }
});
