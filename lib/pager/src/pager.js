"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _vue = require("vue");

var _xeUtils = _interopRequireDefault(require("xe-utils"));

var _conf = _interopRequireDefault(require("../../v-x-e-table/src/conf"));

var _event = require("../../tools/event");

var _size = require("../../hooks/size");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __assign = void 0 && (void 0).__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

var _default2 = (0, _vue.defineComponent)({
  name: 'VxePager',
  props: {
    size: {
      type: String,
      default: function _default() {
        return _conf.default.pager.size || _conf.default.size;
      }
    },
    // 自定义布局
    layouts: {
      type: Array,
      default: function _default() {
        return _conf.default.pager.layouts || ['PrevJump', 'PrevPage', 'Jump', 'PageCount', 'NextPage', 'NextJump', 'Sizes', 'Total'];
      }
    },
    // 当前页
    currentPage: {
      type: Number,
      default: 1
    },
    // 加载中
    loading: Boolean,
    // 每页大小
    pageSize: {
      type: Number,
      default: function _default() {
        return _conf.default.pager.pageSize || 10;
      }
    },
    // 总条数
    total: {
      type: Number,
      default: 0
    },
    // 显示页码按钮的数量
    pagerCount: {
      type: Number,
      default: function _default() {
        return _conf.default.pager.pagerCount || 7;
      }
    },
    // 每页大小选项列表
    pageSizes: {
      type: Array,
      default: function _default() {
        return _conf.default.pager.pageSizes || [10, 15, 20, 50, 100];
      }
    },
    // 列对其方式
    align: {
      type: String,
      default: function _default() {
        return _conf.default.pager.align;
      }
    },
    // 带边框
    border: {
      type: Boolean,
      default: function _default() {
        return _conf.default.pager.border;
      }
    },
    // 带背景颜色
    background: {
      type: Boolean,
      default: function _default() {
        return _conf.default.pager.background;
      }
    },
    // 配套的样式
    perfect: {
      type: Boolean,
      default: function _default() {
        return _conf.default.pager.perfect;
      }
    },
    // 当只有一页时隐藏
    autoHidden: {
      type: Boolean,
      default: function _default() {
        return _conf.default.pager.autoHidden;
      }
    },
    transfer: {
      type: Boolean,
      default: function _default() {
        return _conf.default.pager.transfer;
      }
    },
    className: [String, Function],
    // 自定义图标
    iconPrevPage: String,
    iconJumpPrev: String,
    iconJumpNext: String,
    iconNextPage: String,
    iconJumpMore: String
  },
  emits: ['update:pageSize', 'update:currentPage', 'page-change'],
  setup: function setup(props, context) {
    var slots = context.slots,
        emit = context.emit;

    var xID = _xeUtils.default.uniqueId();

    var computeSize = (0, _size.useSize)(props);
    var $xegrid = (0, _vue.inject)('$xegrid', null);
    var refElem = (0, _vue.ref)();
    var refMaps = {
      refElem: refElem
    };
    var $xepager = {
      xID: xID,
      props: props,
      context: context,
      getRefMaps: function getRefMaps() {
        return refMaps;
      }
    };
    var pagerMethods = {};
    var pagerPrivateMethods = {};

    var getPageCount = function getPageCount(total, size) {
      return Math.max(Math.ceil(total / size), 1);
    };

    var computePageCount = (0, _vue.computed)(function () {
      return getPageCount(props.total, props.pageSize);
    });

    var jumpPageEvent = function jumpPageEvent(evnt, currentPage) {
      emit('update:currentPage', currentPage);

      if (evnt && currentPage !== props.currentPage) {
        pagerMethods.dispatchEvent('page-change', {
          type: 'current',
          pageSize: props.pageSize,
          currentPage: currentPage
        }, evnt);
      }
    };

    var changeCurrentPage = function changeCurrentPage(currentPage, evnt) {
      emit('update:currentPage', currentPage);

      if (evnt && currentPage !== props.currentPage) {
        pagerMethods.dispatchEvent('page-change', {
          type: 'current',
          pageSize: props.pageSize,
          currentPage: currentPage
        }, evnt);
      }
    };

    var triggerJumpEvent = function triggerJumpEvent(evnt) {
      var inputElem = evnt.target;

      var inpValue = _xeUtils.default.toNumber(inputElem.value);

      var pageCount = computePageCount.value;
      var current = inpValue <= 0 ? 1 : inpValue >= pageCount ? pageCount : inpValue;
      inputElem.value = _xeUtils.default.toValueString(current);
      changeCurrentPage(current, evnt);
    };

    var computeNumList = (0, _vue.computed)(function () {
      var pagerCount = props.pagerCount;
      var pageCount = computePageCount.value;
      var len = pageCount > pagerCount ? pagerCount - 2 : pagerCount;
      var rest = [];

      for (var index = 0; index < len; index++) {
        rest.push(index);
      }

      return rest;
    });
    var computeOffsetNumber = (0, _vue.computed)(function () {
      return Math.floor((props.pagerCount - 2) / 2);
    });
    var computeSizeList = (0, _vue.computed)(function () {
      return props.pageSizes.map(function (item) {
        if (_xeUtils.default.isNumber(item)) {
          return {
            value: item,
            label: "" + _conf.default.i18n('vxe.pager.pagesize', [item])
          };
        }

        return __assign({
          value: '',
          label: ''
        }, item);
      });
    });

    var handlePrevPage = function handlePrevPage(evnt) {
      var currentPage = props.currentPage;
      var pageCount = computePageCount.value;

      if (currentPage > 1) {
        changeCurrentPage(Math.min(pageCount, Math.max(currentPage - 1, 1)), evnt);
      }
    };

    var handleNextPage = function handleNextPage(evnt) {
      var currentPage = props.currentPage;
      var pageCount = computePageCount.value;

      if (currentPage < pageCount) {
        changeCurrentPage(Math.min(pageCount, currentPage + 1), evnt);
      }
    };

    var handlePrevJump = function handlePrevJump(evnt) {
      var numList = computeNumList.value;
      changeCurrentPage(Math.max(props.currentPage - numList.length, 1), evnt);
    };

    var handleNextJump = function handleNextJump(evnt) {
      var pageCount = computePageCount.value;
      var numList = computeNumList.value;
      changeCurrentPage(Math.min(props.currentPage + numList.length, pageCount), evnt);
    };

    var pageSizeEvent = function pageSizeEvent(params) {
      var value = params.value;

      var pageSize = _xeUtils.default.toNumber(value);

      emit('update:pageSize', pageSize);
      pagerMethods.dispatchEvent('page-change', {
        type: 'size',
        pageSize: pageSize,
        currentPage: Math.min(props.currentPage, getPageCount(props.total, pageSize))
      });
    };

    var jumpKeydownEvent = function jumpKeydownEvent(evnt) {
      if ((0, _event.hasEventKey)(evnt, _event.EVENT_KEYS.ENTER)) {
        triggerJumpEvent(evnt);
      } else if ((0, _event.hasEventKey)(evnt, _event.EVENT_KEYS.ARROW_UP)) {
        evnt.preventDefault();
        handleNextPage(evnt);
      } else if ((0, _event.hasEventKey)(evnt, _event.EVENT_KEYS.ARROW_DOWN)) {
        evnt.preventDefault();
        handlePrevPage(evnt);
      }
    }; // 上一页


    var renderPrevPage = function renderPrevPage() {
      return (0, _vue.h)('button', {
        class: ['vxe-pager--prev-btn', {
          'is--disabled': props.currentPage <= 1
        }],
        type: 'button',
        title: _conf.default.i18n('vxe.pager.prevPage'),
        onClick: handlePrevPage
      }, [(0, _vue.h)('i', {
        class: ['vxe-pager--btn-icon', props.iconPrevPage || _conf.default.icon.PAGER_PREV_PAGE]
      })]);
    }; // 向上翻页


    var renderPrevJump = function renderPrevJump(tagName) {
      return (0, _vue.h)(tagName || 'button', {
        class: ['vxe-pager--jump-prev', {
          'is--fixed': !tagName,
          'is--disabled': props.currentPage <= 1
        }],
        type: 'button',
        title: _conf.default.i18n('vxe.pager.prevJump'),
        onClick: handlePrevJump
      }, [tagName ? (0, _vue.h)('i', {
        class: ['vxe-pager--jump-more-icon', props.iconJumpMore || _conf.default.icon.PAGER_JUMP_MORE]
      }) : null, (0, _vue.h)('i', {
        class: ['vxe-pager--jump-icon', props.iconJumpPrev || _conf.default.icon.PAGER_JUMP_PREV]
      })]);
    }; // 向下翻页


    var renderNextJump = function renderNextJump(tagName) {
      var pageCount = computePageCount.value;
      return (0, _vue.h)(tagName || 'button', {
        class: ['vxe-pager--jump-next', {
          'is--fixed': !tagName,
          'is--disabled': props.currentPage >= pageCount
        }],
        type: 'button',
        title: _conf.default.i18n('vxe.pager.nextJump'),
        onClick: handleNextJump
      }, [tagName ? (0, _vue.h)('i', {
        class: ['vxe-pager--jump-more-icon', props.iconJumpMore || _conf.default.icon.PAGER_JUMP_MORE]
      }) : null, (0, _vue.h)('i', {
        class: ['vxe-pager--jump-icon', props.iconJumpNext || _conf.default.icon.PAGER_JUMP_NEXT]
      })]);
    }; // 下一页


    var renderNextPage = function renderNextPage() {
      var pageCount = computePageCount.value;
      return (0, _vue.h)('button', {
        class: ['vxe-pager--next-btn', {
          'is--disabled': props.currentPage >= pageCount
        }],
        type: 'button',
        title: _conf.default.i18n('vxe.pager.nextPage'),
        onClick: handleNextPage
      }, [(0, _vue.h)('i', {
        class: ['vxe-pager--btn-icon', props.iconNextPage || _conf.default.icon.PAGER_NEXT_PAGE]
      })]);
    }; // 页数


    var renderNumber = function renderNumber(showJump) {
      var currentPage = props.currentPage,
          pagerCount = props.pagerCount;
      var nums = [];
      var pageCount = computePageCount.value;
      var numList = computeNumList.value;
      var offsetNumber = computeOffsetNumber.value;
      var isOv = pageCount > pagerCount;
      var isLt = isOv && currentPage > offsetNumber + 1;
      var isGt = isOv && currentPage < pageCount - offsetNumber;
      var startNumber = 1;

      if (isOv) {
        if (currentPage >= pageCount - offsetNumber) {
          startNumber = Math.max(pageCount - numList.length + 1, 1);
        } else {
          startNumber = Math.max(currentPage - offsetNumber, 1);
        }
      }

      if (showJump && isLt) {
        nums.push((0, _vue.h)('button', {
          class: 'vxe-pager--num-btn',
          type: 'button',
          onClick: function onClick(evnt) {
            return jumpPageEvent(evnt, 1);
          }
        }, 1), renderPrevJump('span'));
      }

      numList.forEach(function (item, index) {
        var number = startNumber + index;

        if (number <= pageCount) {
          nums.push((0, _vue.h)('button', {
            key: number,
            class: ['vxe-pager--num-btn', {
              'is--active': currentPage === number
            }],
            type: 'button',
            onClick: function onClick(evnt) {
              return jumpPageEvent(evnt, number);
            }
          }, number));
        }
      });

      if (showJump && isGt) {
        nums.push(renderNextJump('button'), (0, _vue.h)('button', {
          class: 'vxe-pager--num-btn',
          type: 'button',
          onClick: function onClick(evnt) {
            return jumpPageEvent(evnt, pageCount);
          }
        }, pageCount));
      }

      return (0, _vue.h)('span', {
        class: 'vxe-pager--btn-wrapper'
      }, nums);
    }; // jumpNumber


    var renderJumpNumber = function renderJumpNumber() {
      return renderNumber(true);
    }; // sizes


    var renderSizes = function renderSizes() {
      var sizeList = computeSizeList.value;
      return (0, _vue.h)((0, _vue.resolveComponent)('vxe-select'), {
        class: 'vxe-pager--sizes',
        modelValue: props.pageSize,
        placement: 'top',
        transfer: props.transfer,
        options: sizeList,
        onChange: pageSizeEvent
      });
    }; // Jump


    var renderJump = function renderJump(isFull) {
      return (0, _vue.h)('span', {
        class: 'vxe-pager--jump'
      }, [isFull ? (0, _vue.h)('span', {
        class: 'vxe-pager--goto-text'
      }, _conf.default.i18n('vxe.pager.goto')) : null, (0, _vue.h)('input', {
        class: 'vxe-pager--goto',
        value: props.currentPage,
        type: 'text',
        autocomplete: 'off',
        onKeydown: jumpKeydownEvent,
        onBlur: triggerJumpEvent
      }), isFull ? (0, _vue.h)('span', {
        class: 'vxe-pager--classifier-text'
      }, _conf.default.i18n('vxe.pager.pageClassifier')) : null]);
    }; // FullJump


    var renderFullJump = function renderFullJump() {
      return renderJump(true);
    }; // PageCount


    var renderPageCount = function renderPageCount() {
      var pageCount = computePageCount.value;
      return (0, _vue.h)('span', {
        class: 'vxe-pager--count'
      }, [(0, _vue.h)('span', {
        class: 'vxe-pager--separator'
      }), (0, _vue.h)('span', pageCount)]);
    }; // total


    var renderTotal = function renderTotal() {
      return (0, _vue.h)('span', {
        class: 'vxe-pager--total'
      }, _conf.default.i18n('vxe.pager.total', [props.total]));
    };

    pagerMethods = {
      dispatchEvent: function dispatchEvent(type, params, evnt) {
        emit(type, Object.assign({
          $pager: $xepager,
          $event: evnt
        }, params));
      },
      prevPage: function prevPage() {
        handlePrevPage();
        return (0, _vue.nextTick)();
      },
      nextPage: function nextPage() {
        handleNextPage();
        return (0, _vue.nextTick)();
      },
      prevJump: function prevJump() {
        handlePrevJump();
        return (0, _vue.nextTick)();
      },
      nextJump: function nextJump() {
        handleNextJump();
        return (0, _vue.nextTick)();
      }
    };
    pagerPrivateMethods = {
      handlePrevPage: handlePrevPage,
      handleNextPage: handleNextPage,
      handlePrevJump: handlePrevJump,
      handleNextJump: handleNextJump
    };
    Object.assign($xepager, pagerMethods, pagerPrivateMethods);

    var renderVN = function renderVN() {
      var _a;

      var align = props.align,
          layouts = props.layouts,
          className = props.className;
      var childNodes = [];
      var vSize = computeSize.value;
      var pageCount = computePageCount.value;

      if (slots.left) {
        childNodes.push((0, _vue.h)('span', {
          class: 'vxe-pager--left-wrapper'
        }, slots.left({
          $grid: $xegrid
        })));
      }

      layouts.forEach(function (name) {
        var renderFn;

        switch (name) {
          case 'PrevPage':
            renderFn = renderPrevPage;
            break;

          case 'PrevJump':
            renderFn = renderPrevJump;
            break;

          case 'Number':
            renderFn = renderNumber;
            break;

          case 'JumpNumber':
            renderFn = renderJumpNumber;
            break;

          case 'NextJump':
            renderFn = renderNextJump;
            break;

          case 'NextPage':
            renderFn = renderNextPage;
            break;

          case 'Sizes':
            renderFn = renderSizes;
            break;

          case 'FullJump':
            renderFn = renderFullJump;
            break;

          case 'Jump':
            renderFn = renderJump;
            break;

          case 'PageCount':
            renderFn = renderPageCount;
            break;

          case 'Total':
            renderFn = renderTotal;
            break;
        }

        if (renderFn) {
          childNodes.push(renderFn());
        }
      });

      if (slots.right) {
        childNodes.push((0, _vue.h)('span', {
          class: 'vxe-pager--right-wrapper'
        }, slots.right({
          $grid: $xegrid
        })));
      }

      return (0, _vue.h)('div', {
        ref: refElem,
        class: ['vxe-pager', className ? _xeUtils.default.isFunction(className) ? className({
          $pager: $xepager
        }) : className : '', (_a = {}, _a["size--" + vSize] = vSize, _a["align--" + align] = align, _a['is--border'] = props.border, _a['is--background'] = props.background, _a['is--perfect'] = props.perfect, _a['is--hidden'] = props.autoHidden && pageCount === 1, _a['is--loading'] = props.loading, _a)]
      }, [(0, _vue.h)('div', {
        class: 'vxe-pager--wrapper'
      }, childNodes)]);
    };

    $xepager.renderVN = renderVN;
    return $xepager;
  },
  render: function render() {
    return this.renderVN();
  }
});

exports.default = _default2;