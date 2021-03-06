import { defineComponent, h, Teleport, ref, resolveComponent, computed, provide, onUnmounted, reactive, nextTick, watch, onMounted } from 'vue';
import XEUtils from 'xe-utils';
import GlobalConfig from '../../v-x-e-table/src/conf';
import { useSize } from '../../hooks/size';
import { getEventTargetNode, getAbsolutePos } from '../../tools/dom';
import { getLastZIndex, nextZIndex, getFuncText, formatText } from '../../tools/utils';
import { GlobalEvent, hasEventKey, EVENT_KEYS } from '../../tools/event';
function isOptionVisible(option) {
    return option.visible !== false;
}
function getOptUniqueId() {
    return XEUtils.uniqueId('opt_');
}
export default defineComponent({
    name: 'VxeSelect',
    props: {
        modelValue: null,
        clearable: Boolean,
        placeholder: String,
        loading: Boolean,
        disabled: Boolean,
        multiple: Boolean,
        multiCharOverflow: { type: [Number, String], default: function () { return GlobalConfig.select.multiCharOverflow; } },
        prefixIcon: String,
        placement: String,
        options: Array,
        optionProps: Object,
        optionGroups: Array,
        optionGroupProps: Object,
        className: [String, Function],
        size: { type: String, default: function () { return GlobalConfig.select.size || GlobalConfig.size; } },
        emptyText: String,
        optionId: { type: String, default: function () { return GlobalConfig.select.optionId; } },
        optionKey: Boolean,
        transfer: { type: Boolean, default: function () { return GlobalConfig.select.transfer; } }
    },
    emits: [
        'update:modelValue',
        'change',
        'clear'
    ],
    setup: function (props, context) {
        var slots = context.slots, emit = context.emit;
        var xID = XEUtils.uniqueId();
        var computeSize = useSize(props);
        var reactData = reactive({
            inited: false,
            staticOptions: [],
            fullGroupList: [],
            fullOptionList: [],
            visibleGroupList: [],
            visibleOptionList: [],
            panelIndex: 0,
            panelStyle: {},
            panelPlacement: null,
            currentValue: null,
            visiblePanel: false,
            animatVisible: false,
            isActivated: false
        });
        var refElem = ref();
        var refInput = ref();
        var refOptionWrapper = ref();
        var refOptionPanel = ref();
        var refMaps = {
            refElem: refElem
        };
        var $xeselect = {
            xID: xID,
            props: props,
            context: context,
            reactData: reactData,
            getRefMaps: function () { return refMaps; }
        };
        var selectMethods = {};
        var computePropsOpts = computed(function () {
            return props.optionProps || {};
        });
        var computeGroupPropsOpts = computed(function () {
            return props.optionGroupProps || {};
        });
        var computeLabelField = computed(function () {
            var propsOpts = computePropsOpts.value;
            return propsOpts.label || 'label';
        });
        var computeValueField = computed(function () {
            var propsOpts = computePropsOpts.value;
            return propsOpts.value || 'value';
        });
        var computeGroupLabelField = computed(function () {
            var groupPropsOpts = computeGroupPropsOpts.value;
            return groupPropsOpts.label || 'label';
        });
        var computeGroupOptionsField = computed(function () {
            var groupPropsOpts = computeGroupPropsOpts.value;
            return groupPropsOpts.options || 'options';
        });
        var computeIsGroup = computed(function () {
            return reactData.fullGroupList.some(function (item) { return item.options && item.options.length; });
        });
        var computeMultiMaxCharNum = computed(function () {
            return XEUtils.toNumber(props.multiCharOverflow);
        });
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
        var findOption = function (optionValue) {
            var fullOptionList = reactData.fullOptionList, fullGroupList = reactData.fullGroupList;
            var isGroup = computeIsGroup.value;
            var valueField = computeValueField.value;
            if (isGroup) {
                for (var gIndex = 0; gIndex < fullGroupList.length; gIndex++) {
                    var group = fullGroupList[gIndex];
                    if (group.options) {
                        for (var index = 0; index < group.options.length; index++) {
                            var option = group.options[index];
                            if (optionValue === option[valueField]) {
                                return option;
                            }
                        }
                    }
                }
            }
            return fullOptionList.find(function (item) { return optionValue === item[valueField]; });
        };
        var getSelectLabel = function (value) {
            var labelField = computeLabelField.value;
            var item = findOption(value);
            return XEUtils.toValueString(item ? item[labelField] : value);
        };
        var computeSelectLabel = computed(function () {
            var modelValue = props.modelValue, multiple = props.multiple;
            var multiMaxCharNum = computeMultiMaxCharNum.value;
            if (modelValue && multiple) {
                return (XEUtils.isArray(modelValue) ? modelValue : [modelValue]).map(function (val) {
                    var label = getSelectLabel(val);
                    if (multiMaxCharNum > 0 && label.length > multiMaxCharNum) {
                        return label.substring(0, multiMaxCharNum) + "...";
                    }
                    return label;
                }).join(', ');
            }
            return getSelectLabel(modelValue);
        });
        var getOptkey = function () {
            return props.optionId || '_XID';
        };
        var getOptid = function (option) {
            var optid = option[getOptkey()];
            return optid ? encodeURIComponent(optid) : '';
        };
        /**
         * ???????????????????????????????????????/????????????????????????
         */
        var refreshOption = function () {
            var fullOptionList = reactData.fullOptionList, fullGroupList = reactData.fullGroupList;
            var isGroup = computeIsGroup.value;
            if (isGroup) {
                reactData.visibleGroupList = fullGroupList.filter(isOptionVisible);
            }
            else {
                reactData.visibleOptionList = fullOptionList.filter(isOptionVisible);
            }
            return nextTick();
        };
        var updateCache = function () {
            var fullOptionList = reactData.fullOptionList, fullGroupList = reactData.fullGroupList;
            var groupOptionsField = computeGroupOptionsField.value;
            var key = getOptkey();
            var handleOptis = function (item) {
                if (!getOptid(item)) {
                    item[key] = getOptUniqueId();
                }
            };
            if (fullGroupList.length) {
                fullGroupList.forEach(function (group) {
                    handleOptis(group);
                    if (group[groupOptionsField]) {
                        group[groupOptionsField].forEach(handleOptis);
                    }
                });
            }
            else if (fullOptionList.length) {
                fullOptionList.forEach(handleOptis);
            }
            refreshOption();
        };
        var setCurrentOption = function (option) {
            var valueField = computeValueField.value;
            if (option) {
                reactData.currentValue = option[valueField];
            }
        };
        var scrollToOption = function (option, isAlignBottom) {
            return nextTick().then(function () {
                if (option) {
                    var optWrapperElem = refOptionWrapper.value;
                    var panelElem = refOptionPanel.value;
                    var optElem = panelElem.querySelector("[optid='" + getOptid(option) + "']");
                    if (optWrapperElem && optElem) {
                        var wrapperHeight = optWrapperElem.offsetHeight;
                        var offsetPadding = 5;
                        if (isAlignBottom) {
                            if (optElem.offsetTop + optElem.offsetHeight - optWrapperElem.scrollTop > wrapperHeight) {
                                optWrapperElem.scrollTop = optElem.offsetTop + optElem.offsetHeight - wrapperHeight;
                            }
                        }
                        else {
                            if (optElem.offsetTop + offsetPadding < optWrapperElem.scrollTop || optElem.offsetTop + offsetPadding > optWrapperElem.scrollTop + optWrapperElem.clientHeight) {
                                optWrapperElem.scrollTop = optElem.offsetTop - offsetPadding;
                            }
                        }
                    }
                }
            });
        };
        var updateZindex = function () {
            if (reactData.panelIndex < getLastZIndex()) {
                reactData.panelIndex = nextZIndex();
            }
        };
        var updatePlacement = function () {
            return nextTick().then(function () {
                var transfer = props.transfer, placement = props.placement;
                var panelIndex = reactData.panelIndex;
                var el = refElem.value;
                var panelElem = refOptionPanel.value;
                if (panelElem && el) {
                    var targetHeight = el.offsetHeight;
                    var targetWidth = el.offsetWidth;
                    var panelHeight = panelElem.offsetHeight;
                    var panelWidth = panelElem.offsetWidth;
                    var marginSize = 5;
                    var panelStyle = {
                        zIndex: panelIndex
                    };
                    var _a = getAbsolutePos(el), boundingTop = _a.boundingTop, boundingLeft = _a.boundingLeft, visibleHeight = _a.visibleHeight, visibleWidth = _a.visibleWidth;
                    var panelPlacement = 'bottom';
                    if (transfer) {
                        var left = boundingLeft;
                        var top_1 = boundingTop + targetHeight;
                        if (placement === 'top') {
                            panelPlacement = 'top';
                            top_1 = boundingTop - panelHeight;
                        }
                        else if (!placement) {
                            // ?????????????????????????????????
                            if (top_1 + panelHeight + marginSize > visibleHeight) {
                                panelPlacement = 'top';
                                top_1 = boundingTop - panelHeight;
                            }
                            // ?????????????????????????????????????????????
                            if (top_1 < marginSize) {
                                panelPlacement = 'bottom';
                                top_1 = boundingTop + targetHeight;
                            }
                        }
                        // ??????????????????
                        if (left + panelWidth + marginSize > visibleWidth) {
                            left -= left + panelWidth + marginSize - visibleWidth;
                        }
                        // ??????????????????
                        if (left < marginSize) {
                            left = marginSize;
                        }
                        Object.assign(panelStyle, {
                            left: left + "px",
                            top: top_1 + "px",
                            minWidth: targetWidth + "px"
                        });
                    }
                    else {
                        if (placement === 'top') {
                            panelPlacement = 'top';
                            panelStyle.bottom = targetHeight + "px";
                        }
                        else if (!placement) {
                            // ?????????????????????????????????
                            if (boundingTop + targetHeight + panelHeight > visibleHeight) {
                                // ?????????????????????????????????????????????
                                if (boundingTop - targetHeight - panelHeight > marginSize) {
                                    panelPlacement = 'top';
                                    panelStyle.bottom = targetHeight + "px";
                                }
                            }
                        }
                    }
                    reactData.panelStyle = panelStyle;
                    reactData.panelPlacement = panelPlacement;
                    return nextTick();
                }
            });
        };
        var hidePanelTimeout;
        var showOptionPanel = function () {
            var loading = props.loading, disabled = props.disabled;
            if (!loading && !disabled) {
                clearTimeout(hidePanelTimeout);
                if (!reactData.inited) {
                    reactData.inited = true;
                }
                reactData.isActivated = true;
                reactData.animatVisible = true;
                setTimeout(function () {
                    var modelValue = props.modelValue, multiple = props.multiple;
                    var currOption = findOption(multiple && modelValue ? modelValue[0] : modelValue);
                    reactData.visiblePanel = true;
                    if (currOption) {
                        setCurrentOption(currOption);
                        scrollToOption(currOption);
                    }
                }, 10);
                updateZindex();
                updatePlacement();
            }
        };
        var hideOptionPanel = function () {
            reactData.visiblePanel = false;
            hidePanelTimeout = window.setTimeout(function () {
                reactData.animatVisible = false;
            }, 350);
        };
        var changeEvent = function (evnt, selectValue) {
            if (selectValue !== props.modelValue) {
                emit('update:modelValue', selectValue);
                selectMethods.dispatchEvent('change', { value: selectValue }, evnt);
            }
        };
        var clearValueEvent = function (evnt, selectValue) {
            changeEvent(evnt, selectValue);
            selectMethods.dispatchEvent('clear', { value: selectValue }, evnt);
        };
        var clearEvent = function (params, evnt) {
            clearValueEvent(evnt, null);
            hideOptionPanel();
        };
        var changeOptionEvent = function (evnt, selectValue) {
            var modelValue = props.modelValue, multiple = props.multiple;
            if (multiple) {
                var multipleValue = void 0;
                if (modelValue) {
                    if (modelValue.indexOf(selectValue) === -1) {
                        multipleValue = modelValue.concat([selectValue]);
                    }
                    else {
                        multipleValue = modelValue.filter(function (val) { return val !== selectValue; });
                    }
                }
                else {
                    multipleValue = [selectValue];
                }
                changeEvent(evnt, multipleValue);
            }
            else {
                changeEvent(evnt, selectValue);
                hideOptionPanel();
            }
        };
        var handleGlobalMousewheelEvent = function (evnt) {
            var disabled = props.disabled;
            var visiblePanel = reactData.visiblePanel;
            if (!disabled) {
                if (visiblePanel) {
                    var panelElem = refOptionPanel.value;
                    if (getEventTargetNode(evnt, panelElem).flag) {
                        updatePlacement();
                    }
                    else {
                        hideOptionPanel();
                    }
                }
            }
        };
        var handleGlobalMousedownEvent = function (evnt) {
            var disabled = props.disabled;
            var visiblePanel = reactData.visiblePanel;
            if (!disabled) {
                var el = refElem.value;
                var panelElem = refOptionPanel.value;
                reactData.isActivated = getEventTargetNode(evnt, el).flag || getEventTargetNode(evnt, panelElem).flag;
                if (visiblePanel && !reactData.isActivated) {
                    hideOptionPanel();
                }
            }
        };
        var findOffsetOption = function (optionValue, isUpArrow) {
            var visibleOptionList = reactData.visibleOptionList, visibleGroupList = reactData.visibleGroupList;
            var isGroup = computeIsGroup.value;
            var valueField = computeValueField.value;
            var groupOptionsField = computeGroupOptionsField.value;
            var firstOption;
            var prevOption;
            var nextOption;
            var currOption;
            if (isGroup) {
                for (var gIndex = 0; gIndex < visibleGroupList.length; gIndex++) {
                    var group = visibleGroupList[gIndex];
                    var groupOptionList = group[groupOptionsField];
                    var isGroupDisabled = group.disabled;
                    if (groupOptionList) {
                        for (var index = 0; index < groupOptionList.length; index++) {
                            var option = groupOptionList[index];
                            var isVisible = isOptionVisible(option);
                            var isDisabled = isGroupDisabled || option.disabled;
                            if (!firstOption && !isDisabled) {
                                firstOption = option;
                            }
                            if (currOption) {
                                if (isVisible && !isDisabled) {
                                    nextOption = option;
                                    if (!isUpArrow) {
                                        return { offsetOption: nextOption };
                                    }
                                }
                            }
                            if (optionValue === option[valueField]) {
                                currOption = option;
                                if (isUpArrow) {
                                    return { offsetOption: prevOption };
                                }
                            }
                            else {
                                if (isVisible && !isDisabled) {
                                    prevOption = option;
                                }
                            }
                        }
                    }
                }
            }
            else {
                for (var index = 0; index < visibleOptionList.length; index++) {
                    var option = visibleOptionList[index];
                    var isDisabled = option.disabled;
                    if (!firstOption && !isDisabled) {
                        firstOption = option;
                    }
                    if (currOption) {
                        if (!isDisabled) {
                            nextOption = option;
                            if (!isUpArrow) {
                                return { offsetOption: nextOption };
                            }
                        }
                    }
                    if (optionValue === option[valueField]) {
                        currOption = option;
                        if (isUpArrow) {
                            return { offsetOption: prevOption };
                        }
                    }
                    else {
                        if (!isDisabled) {
                            prevOption = option;
                        }
                    }
                }
            }
            return { firstOption: firstOption };
        };
        var handleGlobalKeydownEvent = function (evnt) {
            var clearable = props.clearable, disabled = props.disabled;
            var visiblePanel = reactData.visiblePanel, currentValue = reactData.currentValue;
            if (!disabled) {
                var isTab = hasEventKey(evnt, EVENT_KEYS.TAB);
                var isEnter = hasEventKey(evnt, EVENT_KEYS.ENTER);
                var isEsc = hasEventKey(evnt, EVENT_KEYS.ESCAPE);
                var isUpArrow = hasEventKey(evnt, EVENT_KEYS.ARROW_UP);
                var isDwArrow = hasEventKey(evnt, EVENT_KEYS.ARROW_DOWN);
                var isDel = hasEventKey(evnt, EVENT_KEYS.DELETE);
                var isSpacebar = hasEventKey(evnt, EVENT_KEYS.SPACEBAR);
                if (isTab) {
                    reactData.isActivated = false;
                }
                if (visiblePanel) {
                    if (isEsc || isTab) {
                        hideOptionPanel();
                    }
                    else if (isEnter) {
                        evnt.preventDefault();
                        evnt.stopPropagation();
                        changeOptionEvent(evnt, currentValue);
                    }
                    else if (isUpArrow || isDwArrow) {
                        evnt.preventDefault();
                        var _a = findOffsetOption(currentValue, isUpArrow), firstOption = _a.firstOption, offsetOption = _a.offsetOption;
                        if (!offsetOption && !findOption(currentValue)) {
                            offsetOption = firstOption;
                        }
                        setCurrentOption(offsetOption);
                        scrollToOption(offsetOption, isDwArrow);
                    }
                    else if (isSpacebar) {
                        evnt.preventDefault();
                    }
                }
                else if ((isUpArrow || isDwArrow || isEnter || isSpacebar) && reactData.isActivated) {
                    evnt.preventDefault();
                    showOptionPanel();
                }
                if (reactData.isActivated) {
                    if (isDel && clearable) {
                        clearValueEvent(evnt, null);
                    }
                }
            }
        };
        var handleGlobalBlurEvent = function () {
            hideOptionPanel();
        };
        var focusEvent = function () {
            if (!props.disabled) {
                reactData.isActivated = true;
            }
        };
        var blurEvent = function () {
            reactData.isActivated = false;
        };
        var togglePanelEvent = function (params) {
            var $event = params.$event;
            $event.preventDefault();
            if (reactData.visiblePanel) {
                hideOptionPanel();
            }
            else {
                showOptionPanel();
            }
        };
        var renderOption = function (list, group) {
            var optionKey = props.optionKey, modelValue = props.modelValue, multiple = props.multiple;
            var currentValue = reactData.currentValue;
            var labelField = computeLabelField.value;
            var valueField = computeValueField.value;
            var isGroup = computeIsGroup.value;
            return list.map(function (option, cIndex) {
                var slots = option.slots, className = option.className;
                var isVisible = !isGroup || isOptionVisible(option);
                var isDisabled = (group && group.disabled) || option.disabled;
                var optionValue = option[valueField];
                var optid = getOptid(option);
                var defaultSlot = slots ? slots.default : null;
                return isVisible ? h('div', {
                    key: optionKey ? optid : cIndex,
                    class: ['vxe-select-option', className ? (XEUtils.isFunction(className) ? className({ option: option, $select: $xeselect }) : className) : '', {
                            'is--disabled': isDisabled,
                            'is--selected': multiple ? (modelValue && modelValue.indexOf(optionValue) > -1) : modelValue === optionValue,
                            'is--hover': currentValue === optionValue
                        }],
                    // attrs
                    optid: optid,
                    // event
                    onMousedown: function (evnt) {
                        var isLeftBtn = evnt.button === 0;
                        if (isLeftBtn) {
                            evnt.stopPropagation();
                        }
                    },
                    onClick: function (evnt) {
                        if (!isDisabled) {
                            changeOptionEvent(evnt, optionValue);
                        }
                    },
                    onMouseenter: function () {
                        if (!isDisabled) {
                            setCurrentOption(option);
                        }
                    }
                }, defaultSlot ? callSlot(defaultSlot, { option: option, $select: $xeselect }) : formatText(getFuncText(option[labelField]))) : null;
            });
        };
        var renderOptgroup = function () {
            var optionKey = props.optionKey;
            var visibleGroupList = reactData.visibleGroupList;
            var groupLabelField = computeGroupLabelField.value;
            var groupOptionsField = computeGroupOptionsField.value;
            return visibleGroupList.map(function (group, gIndex) {
                var slots = group.slots, className = group.className;
                var optid = getOptid(group);
                var isGroupDisabled = group.disabled;
                var defaultSlot = slots ? slots.default : null;
                return h('div', {
                    key: optionKey ? optid : gIndex,
                    class: ['vxe-optgroup', className ? (XEUtils.isFunction(className) ? className({ option: group, $select: $xeselect }) : className) : '', {
                            'is--disabled': isGroupDisabled
                        }],
                    // attrs
                    optid: optid
                }, [
                    h('div', {
                        class: 'vxe-optgroup--title'
                    }, defaultSlot ? callSlot(defaultSlot, { option: group, $select: $xeselect }) : getFuncText(group[groupLabelField])),
                    h('div', {
                        class: 'vxe-optgroup--wrapper'
                    }, renderOption(group[groupOptionsField] || [], group))
                ]);
            });
        };
        var renderOpts = function () {
            var visibleGroupList = reactData.visibleGroupList, visibleOptionList = reactData.visibleOptionList;
            var isGroup = computeIsGroup.value;
            if (isGroup) {
                if (visibleGroupList.length) {
                    return renderOptgroup();
                }
            }
            else {
                if (visibleOptionList.length) {
                    return renderOption(visibleOptionList);
                }
            }
            return [
                h('div', {
                    class: 'vxe-select--empty-placeholder'
                }, props.emptyText || GlobalConfig.i18n('vxe.select.emptyText'))
            ];
        };
        selectMethods = {
            dispatchEvent: function (type, params, evnt) {
                emit(type, Object.assign({ $select: $xeselect, $event: evnt }, params));
            },
            isPanelVisible: function () {
                return reactData.visiblePanel;
            },
            togglePanel: function () {
                if (reactData.visiblePanel) {
                    hideOptionPanel();
                }
                else {
                    showOptionPanel();
                }
                return nextTick();
            },
            hidePanel: function () {
                if (reactData.visiblePanel) {
                    hideOptionPanel();
                }
                return nextTick();
            },
            showPanel: function () {
                if (!reactData.visiblePanel) {
                    showOptionPanel();
                }
                return nextTick();
            },
            refreshOption: refreshOption,
            focus: function () {
                var $input = refInput.value;
                reactData.isActivated = true;
                $input.blur();
                return nextTick();
            },
            blur: function () {
                var $input = refInput.value;
                $input.blur();
                reactData.isActivated = false;
                return nextTick();
            }
        };
        Object.assign($xeselect, selectMethods);
        watch(function () { return reactData.staticOptions; }, function (value) {
            if (value.some(function (item) { return item.options && item.options.length; })) {
                reactData.fullOptionList = [];
                reactData.fullGroupList = value;
            }
            else {
                reactData.fullGroupList = [];
                reactData.fullOptionList = value || [];
            }
            updateCache();
        });
        watch(function () { return props.options; }, function (value) {
            reactData.fullGroupList = [];
            reactData.fullOptionList = value || [];
            updateCache();
        });
        watch(function () { return props.optionGroups; }, function (value) {
            reactData.fullOptionList = [];
            reactData.fullGroupList = value || [];
            updateCache();
        });
        onMounted(function () {
            nextTick(function () {
                var options = props.options, optionGroups = props.optionGroups;
                if (optionGroups) {
                    reactData.fullGroupList = optionGroups;
                }
                else if (options) {
                    reactData.fullOptionList = options;
                }
                updateCache();
            });
            GlobalEvent.on($xeselect, 'mousewheel', handleGlobalMousewheelEvent);
            GlobalEvent.on($xeselect, 'mousedown', handleGlobalMousedownEvent);
            GlobalEvent.on($xeselect, 'keydown', handleGlobalKeydownEvent);
            GlobalEvent.on($xeselect, 'blur', handleGlobalBlurEvent);
        });
        onUnmounted(function () {
            GlobalEvent.off($xeselect, 'mousewheel');
            GlobalEvent.off($xeselect, 'mousedown');
            GlobalEvent.off($xeselect, 'keydown');
            GlobalEvent.off($xeselect, 'blur');
        });
        var renderVN = function () {
            var _a, _b;
            var className = props.className, transfer = props.transfer, disabled = props.disabled, loading = props.loading;
            var inited = reactData.inited, isActivated = reactData.isActivated, visiblePanel = reactData.visiblePanel;
            var vSize = computeSize.value;
            var selectLabel = computeSelectLabel.value;
            var prefixSlot = slots.prefix;
            return h('div', {
                ref: refElem,
                class: ['vxe-select', className ? (XEUtils.isFunction(className) ? className({ $select: $xeselect }) : className) : '', (_a = {},
                        _a["size--" + vSize] = vSize,
                        _a['is--visivle'] = visiblePanel,
                        _a['is--disabled'] = disabled,
                        _a['is--loading'] = loading,
                        _a['is--active'] = isActivated,
                        _a)]
            }, [
                h('div', {
                    class: 'vxe-select-slots',
                    ref: 'hideOption'
                }, slots.default ? slots.default({}) : []),
                h(resolveComponent('vxe-input'), {
                    ref: refInput,
                    clearable: props.clearable,
                    placeholder: props.placeholder,
                    readonly: true,
                    disabled: disabled,
                    type: 'text',
                    prefixIcon: props.prefixIcon,
                    suffixIcon: loading ? GlobalConfig.icon.SELECT_LOADED : (visiblePanel ? GlobalConfig.icon.SELECT_OPEN : GlobalConfig.icon.SELECT_CLOSE),
                    modelValue: selectLabel,
                    onClear: clearEvent,
                    onClick: togglePanelEvent,
                    onFocus: focusEvent,
                    onBlur: blurEvent,
                    onSuffixClick: togglePanelEvent
                }, prefixSlot ? {
                    prefix: function () { return prefixSlot({}); }
                } : {}),
                h(Teleport, {
                    to: 'body',
                    disabled: transfer ? !inited : true
                }, [
                    h('div', {
                        ref: refOptionPanel,
                        class: ['vxe-table--ignore-clear vxe-select--panel', (_b = {},
                                _b["size--" + vSize] = vSize,
                                _b['is--transfer'] = transfer,
                                _b['animat--leave'] = !loading && reactData.animatVisible,
                                _b['animat--enter'] = !loading && visiblePanel,
                                _b)],
                        placement: reactData.panelPlacement,
                        style: reactData.panelStyle
                    }, inited ? [
                        h('div', {
                            ref: refOptionWrapper,
                            class: 'vxe-select-option--wrapper'
                        }, renderOpts())
                    ] : [])
                ])
            ]);
        };
        $xeselect.renderVN = renderVN;
        provide('$xeselect', $xeselect);
        return $xeselect;
    },
    render: function () {
        return this.renderVN();
    }
});
