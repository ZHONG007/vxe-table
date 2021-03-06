"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _vue = require("vue");

var _xeUtils = _interopRequireDefault(require("xe-utils"));

var _conf = _interopRequireDefault(require("../../v-x-e-table/src/conf"));

var _size = require("../../hooks/size");

var _dom = require("../../tools/dom");

var _utils = require("../../tools/utils");

var _event = require("../../tools/event");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isOptionVisible(option) {
  return option.visible !== false;
}

function getOptUniqueId() {
  return _xeUtils.default.uniqueId('opt_');
}

var _default2 = (0, _vue.defineComponent)({
  name: 'VxeSelect',
  props: {
    modelValue: null,
    clearable: Boolean,
    placeholder: String,
    loading: Boolean,
    disabled: Boolean,
    multiple: Boolean,
    multiCharOverflow: {
      type: [Number, String],
      default: function _default() {
        return _conf.default.select.multiCharOverflow;
      }
    },
    prefixIcon: String,
    placement: String,
    options: Array,
    optionProps: Object,
    optionGroups: Array,
    optionGroupProps: Object,
    className: [String, Function],
    size: {
      type: String,
      default: function _default() {
        return _conf.default.select.size || _conf.default.size;
      }
    },
    emptyText: String,
    optionId: {
      type: String,
      default: function _default() {
        return _conf.default.select.optionId;
      }
    },
    optionKey: Boolean,
    transfer: {
      type: Boolean,
      default: function _default() {
        return _conf.default.select.transfer;
      }
    }
  },
  emits: ['update:modelValue', 'change', 'clear'],
  setup: function setup(props, context) {
    var slots = context.slots,
        emit = context.emit;

    var xID = _xeUtils.default.uniqueId();

    var computeSize = (0, _size.useSize)(props);
    var reactData = (0, _vue.reactive)({
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
    var refElem = (0, _vue.ref)();
    var refInput = (0, _vue.ref)();
    var refOptionWrapper = (0, _vue.ref)();
    var refOptionPanel = (0, _vue.ref)();
    var refMaps = {
      refElem: refElem
    };
    var $xeselect = {
      xID: xID,
      props: props,
      context: context,
      reactData: reactData,
      getRefMaps: function getRefMaps() {
        return refMaps;
      }
    };
    var selectMethods = {};
    var computePropsOpts = (0, _vue.computed)(function () {
      return props.optionProps || {};
    });
    var computeGroupPropsOpts = (0, _vue.computed)(function () {
      return props.optionGroupProps || {};
    });
    var computeLabelField = (0, _vue.computed)(function () {
      var propsOpts = computePropsOpts.value;
      return propsOpts.label || 'label';
    });
    var computeValueField = (0, _vue.computed)(function () {
      var propsOpts = computePropsOpts.value;
      return propsOpts.value || 'value';
    });
    var computeGroupLabelField = (0, _vue.computed)(function () {
      var groupPropsOpts = computeGroupPropsOpts.value;
      return groupPropsOpts.label || 'label';
    });
    var computeGroupOptionsField = (0, _vue.computed)(function () {
      var groupPropsOpts = computeGroupPropsOpts.value;
      return groupPropsOpts.options || 'options';
    });
    var computeIsGroup = (0, _vue.computed)(function () {
      return reactData.fullGroupList.some(function (item) {
        return item.options && item.options.length;
      });
    });
    var computeMultiMaxCharNum = (0, _vue.computed)(function () {
      return _xeUtils.default.toNumber(props.multiCharOverflow);
    });

    var callSlot = function callSlot(slotFunc, params) {
      if (slotFunc) {
        if (_xeUtils.default.isString(slotFunc)) {
          slotFunc = slots[slotFunc] || null;
        }

        if (_xeUtils.default.isFunction(slotFunc)) {
          return slotFunc(params);
        }
      }

      return [];
    };

    var findOption = function findOption(optionValue) {
      var fullOptionList = reactData.fullOptionList,
          fullGroupList = reactData.fullGroupList;
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

      return fullOptionList.find(function (item) {
        return optionValue === item[valueField];
      });
    };

    var getSelectLabel = function getSelectLabel(value) {
      var labelField = computeLabelField.value;
      var item = findOption(value);
      return _xeUtils.default.toValueString(item ? item[labelField] : value);
    };

    var computeSelectLabel = (0, _vue.computed)(function () {
      var modelValue = props.modelValue,
          multiple = props.multiple;
      var multiMaxCharNum = computeMultiMaxCharNum.value;

      if (modelValue && multiple) {
        return (_xeUtils.default.isArray(modelValue) ? modelValue : [modelValue]).map(function (val) {
          var label = getSelectLabel(val);

          if (multiMaxCharNum > 0 && label.length > multiMaxCharNum) {
            return label.substring(0, multiMaxCharNum) + "...";
          }

          return label;
        }).join(', ');
      }

      return getSelectLabel(modelValue);
    });

    var getOptkey = function getOptkey() {
      return props.optionId || '_XID';
    };

    var getOptid = function getOptid(option) {
      var optid = option[getOptkey()];
      return optid ? encodeURIComponent(optid) : '';
    };
    /**
     * ???????????????????????????????????????/????????????????????????
     */


    var refreshOption = function refreshOption() {
      var fullOptionList = reactData.fullOptionList,
          fullGroupList = reactData.fullGroupList;
      var isGroup = computeIsGroup.value;

      if (isGroup) {
        reactData.visibleGroupList = fullGroupList.filter(isOptionVisible);
      } else {
        reactData.visibleOptionList = fullOptionList.filter(isOptionVisible);
      }

      return (0, _vue.nextTick)();
    };

    var updateCache = function updateCache() {
      var fullOptionList = reactData.fullOptionList,
          fullGroupList = reactData.fullGroupList;
      var groupOptionsField = computeGroupOptionsField.value;
      var key = getOptkey();

      var handleOptis = function handleOptis(item) {
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
      } else if (fullOptionList.length) {
        fullOptionList.forEach(handleOptis);
      }

      refreshOption();
    };

    var setCurrentOption = function setCurrentOption(option) {
      var valueField = computeValueField.value;

      if (option) {
        reactData.currentValue = option[valueField];
      }
    };

    var scrollToOption = function scrollToOption(option, isAlignBottom) {
      return (0, _vue.nextTick)().then(function () {
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
            } else {
              if (optElem.offsetTop + offsetPadding < optWrapperElem.scrollTop || optElem.offsetTop + offsetPadding > optWrapperElem.scrollTop + optWrapperElem.clientHeight) {
                optWrapperElem.scrollTop = optElem.offsetTop - offsetPadding;
              }
            }
          }
        }
      });
    };

    var updateZindex = function updateZindex() {
      if (reactData.panelIndex < (0, _utils.getLastZIndex)()) {
        reactData.panelIndex = (0, _utils.nextZIndex)();
      }
    };

    var updatePlacement = function updatePlacement() {
      return (0, _vue.nextTick)().then(function () {
        var transfer = props.transfer,
            placement = props.placement;
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

          var _a = (0, _dom.getAbsolutePos)(el),
              boundingTop = _a.boundingTop,
              boundingLeft = _a.boundingLeft,
              visibleHeight = _a.visibleHeight,
              visibleWidth = _a.visibleWidth;

          var panelPlacement = 'bottom';

          if (transfer) {
            var left = boundingLeft;
            var top_1 = boundingTop + targetHeight;

            if (placement === 'top') {
              panelPlacement = 'top';
              top_1 = boundingTop - panelHeight;
            } else if (!placement) {
              // ?????????????????????????????????
              if (top_1 + panelHeight + marginSize > visibleHeight) {
                panelPlacement = 'top';
                top_1 = boundingTop - panelHeight;
              } // ?????????????????????????????????????????????


              if (top_1 < marginSize) {
                panelPlacement = 'bottom';
                top_1 = boundingTop + targetHeight;
              }
            } // ??????????????????


            if (left + panelWidth + marginSize > visibleWidth) {
              left -= left + panelWidth + marginSize - visibleWidth;
            } // ??????????????????


            if (left < marginSize) {
              left = marginSize;
            }

            Object.assign(panelStyle, {
              left: left + "px",
              top: top_1 + "px",
              minWidth: targetWidth + "px"
            });
          } else {
            if (placement === 'top') {
              panelPlacement = 'top';
              panelStyle.bottom = targetHeight + "px";
            } else if (!placement) {
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
          return (0, _vue.nextTick)();
        }
      });
    };

    var hidePanelTimeout;

    var showOptionPanel = function showOptionPanel() {
      var loading = props.loading,
          disabled = props.disabled;

      if (!loading && !disabled) {
        clearTimeout(hidePanelTimeout);

        if (!reactData.inited) {
          reactData.inited = true;
        }

        reactData.isActivated = true;
        reactData.animatVisible = true;
        setTimeout(function () {
          var modelValue = props.modelValue,
              multiple = props.multiple;
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

    var hideOptionPanel = function hideOptionPanel() {
      reactData.visiblePanel = false;
      hidePanelTimeout = window.setTimeout(function () {
        reactData.animatVisible = false;
      }, 350);
    };

    var changeEvent = function changeEvent(evnt, selectValue) {
      if (selectValue !== props.modelValue) {
        emit('update:modelValue', selectValue);
        selectMethods.dispatchEvent('change', {
          value: selectValue
        }, evnt);
      }
    };

    var clearValueEvent = function clearValueEvent(evnt, selectValue) {
      changeEvent(evnt, selectValue);
      selectMethods.dispatchEvent('clear', {
        value: selectValue
      }, evnt);
    };

    var clearEvent = function clearEvent(params, evnt) {
      clearValueEvent(evnt, null);
      hideOptionPanel();
    };

    var changeOptionEvent = function changeOptionEvent(evnt, selectValue) {
      var modelValue = props.modelValue,
          multiple = props.multiple;

      if (multiple) {
        var multipleValue = void 0;

        if (modelValue) {
          if (modelValue.indexOf(selectValue) === -1) {
            multipleValue = modelValue.concat([selectValue]);
          } else {
            multipleValue = modelValue.filter(function (val) {
              return val !== selectValue;
            });
          }
        } else {
          multipleValue = [selectValue];
        }

        changeEvent(evnt, multipleValue);
      } else {
        changeEvent(evnt, selectValue);
        hideOptionPanel();
      }
    };

    var handleGlobalMousewheelEvent = function handleGlobalMousewheelEvent(evnt) {
      var disabled = props.disabled;
      var visiblePanel = reactData.visiblePanel;

      if (!disabled) {
        if (visiblePanel) {
          var panelElem = refOptionPanel.value;

          if ((0, _dom.getEventTargetNode)(evnt, panelElem).flag) {
            updatePlacement();
          } else {
            hideOptionPanel();
          }
        }
      }
    };

    var handleGlobalMousedownEvent = function handleGlobalMousedownEvent(evnt) {
      var disabled = props.disabled;
      var visiblePanel = reactData.visiblePanel;

      if (!disabled) {
        var el = refElem.value;
        var panelElem = refOptionPanel.value;
        reactData.isActivated = (0, _dom.getEventTargetNode)(evnt, el).flag || (0, _dom.getEventTargetNode)(evnt, panelElem).flag;

        if (visiblePanel && !reactData.isActivated) {
          hideOptionPanel();
        }
      }
    };

    var findOffsetOption = function findOffsetOption(optionValue, isUpArrow) {
      var visibleOptionList = reactData.visibleOptionList,
          visibleGroupList = reactData.visibleGroupList;
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
                    return {
                      offsetOption: nextOption
                    };
                  }
                }
              }

              if (optionValue === option[valueField]) {
                currOption = option;

                if (isUpArrow) {
                  return {
                    offsetOption: prevOption
                  };
                }
              } else {
                if (isVisible && !isDisabled) {
                  prevOption = option;
                }
              }
            }
          }
        }
      } else {
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
                return {
                  offsetOption: nextOption
                };
              }
            }
          }

          if (optionValue === option[valueField]) {
            currOption = option;

            if (isUpArrow) {
              return {
                offsetOption: prevOption
              };
            }
          } else {
            if (!isDisabled) {
              prevOption = option;
            }
          }
        }
      }

      return {
        firstOption: firstOption
      };
    };

    var handleGlobalKeydownEvent = function handleGlobalKeydownEvent(evnt) {
      var clearable = props.clearable,
          disabled = props.disabled;
      var visiblePanel = reactData.visiblePanel,
          currentValue = reactData.currentValue;

      if (!disabled) {
        var isTab = (0, _event.hasEventKey)(evnt, _event.EVENT_KEYS.TAB);
        var isEnter = (0, _event.hasEventKey)(evnt, _event.EVENT_KEYS.ENTER);
        var isEsc = (0, _event.hasEventKey)(evnt, _event.EVENT_KEYS.ESCAPE);
        var isUpArrow = (0, _event.hasEventKey)(evnt, _event.EVENT_KEYS.ARROW_UP);
        var isDwArrow = (0, _event.hasEventKey)(evnt, _event.EVENT_KEYS.ARROW_DOWN);
        var isDel = (0, _event.hasEventKey)(evnt, _event.EVENT_KEYS.DELETE);
        var isSpacebar = (0, _event.hasEventKey)(evnt, _event.EVENT_KEYS.SPACEBAR);

        if (isTab) {
          reactData.isActivated = false;
        }

        if (visiblePanel) {
          if (isEsc || isTab) {
            hideOptionPanel();
          } else if (isEnter) {
            evnt.preventDefault();
            evnt.stopPropagation();
            changeOptionEvent(evnt, currentValue);
          } else if (isUpArrow || isDwArrow) {
            evnt.preventDefault();

            var _a = findOffsetOption(currentValue, isUpArrow),
                firstOption = _a.firstOption,
                offsetOption = _a.offsetOption;

            if (!offsetOption && !findOption(currentValue)) {
              offsetOption = firstOption;
            }

            setCurrentOption(offsetOption);
            scrollToOption(offsetOption, isDwArrow);
          } else if (isSpacebar) {
            evnt.preventDefault();
          }
        } else if ((isUpArrow || isDwArrow || isEnter || isSpacebar) && reactData.isActivated) {
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

    var handleGlobalBlurEvent = function handleGlobalBlurEvent() {
      hideOptionPanel();
    };

    var focusEvent = function focusEvent() {
      if (!props.disabled) {
        reactData.isActivated = true;
      }
    };

    var blurEvent = function blurEvent() {
      reactData.isActivated = false;
    };

    var togglePanelEvent = function togglePanelEvent(params) {
      var $event = params.$event;
      $event.preventDefault();

      if (reactData.visiblePanel) {
        hideOptionPanel();
      } else {
        showOptionPanel();
      }
    };

    var renderOption = function renderOption(list, group) {
      var optionKey = props.optionKey,
          modelValue = props.modelValue,
          multiple = props.multiple;
      var currentValue = reactData.currentValue;
      var labelField = computeLabelField.value;
      var valueField = computeValueField.value;
      var isGroup = computeIsGroup.value;
      return list.map(function (option, cIndex) {
        var slots = option.slots,
            className = option.className;
        var isVisible = !isGroup || isOptionVisible(option);
        var isDisabled = group && group.disabled || option.disabled;
        var optionValue = option[valueField];
        var optid = getOptid(option);
        var defaultSlot = slots ? slots.default : null;
        return isVisible ? (0, _vue.h)('div', {
          key: optionKey ? optid : cIndex,
          class: ['vxe-select-option', className ? _xeUtils.default.isFunction(className) ? className({
            option: option,
            $select: $xeselect
          }) : className : '', {
            'is--disabled': isDisabled,
            'is--selected': multiple ? modelValue && modelValue.indexOf(optionValue) > -1 : modelValue === optionValue,
            'is--hover': currentValue === optionValue
          }],
          // attrs
          optid: optid,
          // event
          onMousedown: function onMousedown(evnt) {
            var isLeftBtn = evnt.button === 0;

            if (isLeftBtn) {
              evnt.stopPropagation();
            }
          },
          onClick: function onClick(evnt) {
            if (!isDisabled) {
              changeOptionEvent(evnt, optionValue);
            }
          },
          onMouseenter: function onMouseenter() {
            if (!isDisabled) {
              setCurrentOption(option);
            }
          }
        }, defaultSlot ? callSlot(defaultSlot, {
          option: option,
          $select: $xeselect
        }) : (0, _utils.formatText)((0, _utils.getFuncText)(option[labelField]))) : null;
      });
    };

    var renderOptgroup = function renderOptgroup() {
      var optionKey = props.optionKey;
      var visibleGroupList = reactData.visibleGroupList;
      var groupLabelField = computeGroupLabelField.value;
      var groupOptionsField = computeGroupOptionsField.value;
      return visibleGroupList.map(function (group, gIndex) {
        var slots = group.slots,
            className = group.className;
        var optid = getOptid(group);
        var isGroupDisabled = group.disabled;
        var defaultSlot = slots ? slots.default : null;
        return (0, _vue.h)('div', {
          key: optionKey ? optid : gIndex,
          class: ['vxe-optgroup', className ? _xeUtils.default.isFunction(className) ? className({
            option: group,
            $select: $xeselect
          }) : className : '', {
            'is--disabled': isGroupDisabled
          }],
          // attrs
          optid: optid
        }, [(0, _vue.h)('div', {
          class: 'vxe-optgroup--title'
        }, defaultSlot ? callSlot(defaultSlot, {
          option: group,
          $select: $xeselect
        }) : (0, _utils.getFuncText)(group[groupLabelField])), (0, _vue.h)('div', {
          class: 'vxe-optgroup--wrapper'
        }, renderOption(group[groupOptionsField] || [], group))]);
      });
    };

    var renderOpts = function renderOpts() {
      var visibleGroupList = reactData.visibleGroupList,
          visibleOptionList = reactData.visibleOptionList;
      var isGroup = computeIsGroup.value;

      if (isGroup) {
        if (visibleGroupList.length) {
          return renderOptgroup();
        }
      } else {
        if (visibleOptionList.length) {
          return renderOption(visibleOptionList);
        }
      }

      return [(0, _vue.h)('div', {
        class: 'vxe-select--empty-placeholder'
      }, props.emptyText || _conf.default.i18n('vxe.select.emptyText'))];
    };

    selectMethods = {
      dispatchEvent: function dispatchEvent(type, params, evnt) {
        emit(type, Object.assign({
          $select: $xeselect,
          $event: evnt
        }, params));
      },
      isPanelVisible: function isPanelVisible() {
        return reactData.visiblePanel;
      },
      togglePanel: function togglePanel() {
        if (reactData.visiblePanel) {
          hideOptionPanel();
        } else {
          showOptionPanel();
        }

        return (0, _vue.nextTick)();
      },
      hidePanel: function hidePanel() {
        if (reactData.visiblePanel) {
          hideOptionPanel();
        }

        return (0, _vue.nextTick)();
      },
      showPanel: function showPanel() {
        if (!reactData.visiblePanel) {
          showOptionPanel();
        }

        return (0, _vue.nextTick)();
      },
      refreshOption: refreshOption,
      focus: function focus() {
        var $input = refInput.value;
        reactData.isActivated = true;
        $input.blur();
        return (0, _vue.nextTick)();
      },
      blur: function blur() {
        var $input = refInput.value;
        $input.blur();
        reactData.isActivated = false;
        return (0, _vue.nextTick)();
      }
    };
    Object.assign($xeselect, selectMethods);
    (0, _vue.watch)(function () {
      return reactData.staticOptions;
    }, function (value) {
      if (value.some(function (item) {
        return item.options && item.options.length;
      })) {
        reactData.fullOptionList = [];
        reactData.fullGroupList = value;
      } else {
        reactData.fullGroupList = [];
        reactData.fullOptionList = value || [];
      }

      updateCache();
    });
    (0, _vue.watch)(function () {
      return props.options;
    }, function (value) {
      reactData.fullGroupList = [];
      reactData.fullOptionList = value || [];
      updateCache();
    });
    (0, _vue.watch)(function () {
      return props.optionGroups;
    }, function (value) {
      reactData.fullOptionList = [];
      reactData.fullGroupList = value || [];
      updateCache();
    });
    (0, _vue.onMounted)(function () {
      (0, _vue.nextTick)(function () {
        var options = props.options,
            optionGroups = props.optionGroups;

        if (optionGroups) {
          reactData.fullGroupList = optionGroups;
        } else if (options) {
          reactData.fullOptionList = options;
        }

        updateCache();
      });

      _event.GlobalEvent.on($xeselect, 'mousewheel', handleGlobalMousewheelEvent);

      _event.GlobalEvent.on($xeselect, 'mousedown', handleGlobalMousedownEvent);

      _event.GlobalEvent.on($xeselect, 'keydown', handleGlobalKeydownEvent);

      _event.GlobalEvent.on($xeselect, 'blur', handleGlobalBlurEvent);
    });
    (0, _vue.onUnmounted)(function () {
      _event.GlobalEvent.off($xeselect, 'mousewheel');

      _event.GlobalEvent.off($xeselect, 'mousedown');

      _event.GlobalEvent.off($xeselect, 'keydown');

      _event.GlobalEvent.off($xeselect, 'blur');
    });

    var renderVN = function renderVN() {
      var _a, _b;

      var className = props.className,
          transfer = props.transfer,
          disabled = props.disabled,
          loading = props.loading;
      var inited = reactData.inited,
          isActivated = reactData.isActivated,
          visiblePanel = reactData.visiblePanel;
      var vSize = computeSize.value;
      var selectLabel = computeSelectLabel.value;
      var prefixSlot = slots.prefix;
      return (0, _vue.h)('div', {
        ref: refElem,
        class: ['vxe-select', className ? _xeUtils.default.isFunction(className) ? className({
          $select: $xeselect
        }) : className : '', (_a = {}, _a["size--" + vSize] = vSize, _a['is--visivle'] = visiblePanel, _a['is--disabled'] = disabled, _a['is--loading'] = loading, _a['is--active'] = isActivated, _a)]
      }, [(0, _vue.h)('div', {
        class: 'vxe-select-slots',
        ref: 'hideOption'
      }, slots.default ? slots.default({}) : []), (0, _vue.h)((0, _vue.resolveComponent)('vxe-input'), {
        ref: refInput,
        clearable: props.clearable,
        placeholder: props.placeholder,
        readonly: true,
        disabled: disabled,
        type: 'text',
        prefixIcon: props.prefixIcon,
        suffixIcon: loading ? _conf.default.icon.SELECT_LOADED : visiblePanel ? _conf.default.icon.SELECT_OPEN : _conf.default.icon.SELECT_CLOSE,
        modelValue: selectLabel,
        onClear: clearEvent,
        onClick: togglePanelEvent,
        onFocus: focusEvent,
        onBlur: blurEvent,
        onSuffixClick: togglePanelEvent
      }, prefixSlot ? {
        prefix: function prefix() {
          return prefixSlot({});
        }
      } : {}), (0, _vue.h)(_vue.Teleport, {
        to: 'body',
        disabled: transfer ? !inited : true
      }, [(0, _vue.h)('div', {
        ref: refOptionPanel,
        class: ['vxe-table--ignore-clear vxe-select--panel', (_b = {}, _b["size--" + vSize] = vSize, _b['is--transfer'] = transfer, _b['animat--leave'] = !loading && reactData.animatVisible, _b['animat--enter'] = !loading && visiblePanel, _b)],
        placement: reactData.panelPlacement,
        style: reactData.panelStyle
      }, inited ? [(0, _vue.h)('div', {
        ref: refOptionWrapper,
        class: 'vxe-select-option--wrapper'
      }, renderOpts())] : [])])]);
    };

    $xeselect.renderVN = renderVN;
    (0, _vue.provide)('$xeselect', $xeselect);
    return $xeselect;
  },
  render: function render() {
    return this.renderVN();
  }
});

exports.default = _default2;