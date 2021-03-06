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
import { defineComponent, h, computed, inject, resolveComponent, ref, nextTick } from 'vue';
import XEUtils from 'xe-utils';
import GlobalConfig from '../../v-x-e-table/src/conf';
import { hasEventKey, EVENT_KEYS } from '../../tools/event';
import { useSize } from '../../hooks/size';
export default defineComponent({
    name: 'VxePager',
    props: {
        size: { type: String, default: function () { return GlobalConfig.pager.size || GlobalConfig.size; } },
        // 自定义布局
        layouts: { type: Array, default: function () { return GlobalConfig.pager.layouts || ['PrevJump', 'PrevPage', 'Jump', 'PageCount', 'NextPage', 'NextJump', 'Sizes', 'Total']; } },
        // 当前页
        currentPage: { type: Number, default: 1 },
        // 加载中
        loading: Boolean,
        // 每页大小
        pageSize: { type: Number, default: function () { return GlobalConfig.pager.pageSize || 10; } },
        // 总条数
        total: { type: Number, default: 0 },
        // 显示页码按钮的数量
        pagerCount: { type: Number, default: function () { return GlobalConfig.pager.pagerCount || 7; } },
        // 每页大小选项列表
        pageSizes: { type: Array, default: function () { return GlobalConfig.pager.pageSizes || [10, 15, 20, 50, 100]; } },
        // 列对其方式
        align: { type: String, default: function () { return GlobalConfig.pager.align; } },
        // 带边框
        border: { type: Boolean, default: function () { return GlobalConfig.pager.border; } },
        // 带背景颜色
        background: { type: Boolean, default: function () { return GlobalConfig.pager.background; } },
        // 配套的样式
        perfect: { type: Boolean, default: function () { return GlobalConfig.pager.perfect; } },
        // 当只有一页时隐藏
        autoHidden: { type: Boolean, default: function () { return GlobalConfig.pager.autoHidden; } },
        transfer: { type: Boolean, default: function () { return GlobalConfig.pager.transfer; } },
        className: [String, Function],
        // 自定义图标
        iconPrevPage: String,
        iconJumpPrev: String,
        iconJumpNext: String,
        iconNextPage: String,
        iconJumpMore: String
    },
    emits: [
        'update:pageSize',
        'update:currentPage',
        'page-change'
    ],
    setup: function (props, context) {
        var slots = context.slots, emit = context.emit;
        var xID = XEUtils.uniqueId();
        var computeSize = useSize(props);
        var $xegrid = inject('$xegrid', null);
        var refElem = ref();
        var refMaps = {
            refElem: refElem
        };
        var $xepager = {
            xID: xID,
            props: props,
            context: context,
            getRefMaps: function () { return refMaps; }
        };
        var pagerMethods = {};
        var pagerPrivateMethods = {};
        var getPageCount = function (total, size) {
            return Math.max(Math.ceil(total / size), 1);
        };
        var computePageCount = computed(function () {
            return getPageCount(props.total, props.pageSize);
        });
        var jumpPageEvent = function (evnt, currentPage) {
            emit('update:currentPage', currentPage);
            if (evnt && currentPage !== props.currentPage) {
                pagerMethods.dispatchEvent('page-change', { type: 'current', pageSize: props.pageSize, currentPage: currentPage }, evnt);
            }
        };
        var changeCurrentPage = function (currentPage, evnt) {
            emit('update:currentPage', currentPage);
            if (evnt && currentPage !== props.currentPage) {
                pagerMethods.dispatchEvent('page-change', { type: 'current', pageSize: props.pageSize, currentPage: currentPage }, evnt);
            }
        };
        var triggerJumpEvent = function (evnt) {
            var inputElem = evnt.target;
            var inpValue = XEUtils.toNumber(inputElem.value);
            var pageCount = computePageCount.value;
            var current = inpValue <= 0 ? 1 : inpValue >= pageCount ? pageCount : inpValue;
            inputElem.value = XEUtils.toValueString(current);
            changeCurrentPage(current, evnt);
        };
        var computeNumList = computed(function () {
            var pagerCount = props.pagerCount;
            var pageCount = computePageCount.value;
            var len = pageCount > pagerCount ? pagerCount - 2 : pagerCount;
            var rest = [];
            for (var index = 0; index < len; index++) {
                rest.push(index);
            }
            return rest;
        });
        var computeOffsetNumber = computed(function () {
            return Math.floor((props.pagerCount - 2) / 2);
        });
        var computeSizeList = computed(function () {
            return props.pageSizes.map(function (item) {
                if (XEUtils.isNumber(item)) {
                    return {
                        value: item,
                        label: "" + GlobalConfig.i18n('vxe.pager.pagesize', [item])
                    };
                }
                return __assign({ value: '', label: '' }, item);
            });
        });
        var handlePrevPage = function (evnt) {
            var currentPage = props.currentPage;
            var pageCount = computePageCount.value;
            if (currentPage > 1) {
                changeCurrentPage(Math.min(pageCount, Math.max(currentPage - 1, 1)), evnt);
            }
        };
        var handleNextPage = function (evnt) {
            var currentPage = props.currentPage;
            var pageCount = computePageCount.value;
            if (currentPage < pageCount) {
                changeCurrentPage(Math.min(pageCount, currentPage + 1), evnt);
            }
        };
        var handlePrevJump = function (evnt) {
            var numList = computeNumList.value;
            changeCurrentPage(Math.max(props.currentPage - numList.length, 1), evnt);
        };
        var handleNextJump = function (evnt) {
            var pageCount = computePageCount.value;
            var numList = computeNumList.value;
            changeCurrentPage(Math.min(props.currentPage + numList.length, pageCount), evnt);
        };
        var pageSizeEvent = function (params) {
            var value = params.value;
            var pageSize = XEUtils.toNumber(value);
            emit('update:pageSize', pageSize);
            pagerMethods.dispatchEvent('page-change', { type: 'size', pageSize: pageSize, currentPage: Math.min(props.currentPage, getPageCount(props.total, pageSize)) });
        };
        var jumpKeydownEvent = function (evnt) {
            if (hasEventKey(evnt, EVENT_KEYS.ENTER)) {
                triggerJumpEvent(evnt);
            }
            else if (hasEventKey(evnt, EVENT_KEYS.ARROW_UP)) {
                evnt.preventDefault();
                handleNextPage(evnt);
            }
            else if (hasEventKey(evnt, EVENT_KEYS.ARROW_DOWN)) {
                evnt.preventDefault();
                handlePrevPage(evnt);
            }
        };
        // 上一页
        var renderPrevPage = function () {
            return h('button', {
                class: ['vxe-pager--prev-btn', {
                        'is--disabled': props.currentPage <= 1
                    }],
                type: 'button',
                title: GlobalConfig.i18n('vxe.pager.prevPage'),
                onClick: handlePrevPage
            }, [
                h('i', {
                    class: ['vxe-pager--btn-icon', props.iconPrevPage || GlobalConfig.icon.PAGER_PREV_PAGE]
                })
            ]);
        };
        // 向上翻页
        var renderPrevJump = function (tagName) {
            return h(tagName || 'button', {
                class: ['vxe-pager--jump-prev', {
                        'is--fixed': !tagName,
                        'is--disabled': props.currentPage <= 1
                    }],
                type: 'button',
                title: GlobalConfig.i18n('vxe.pager.prevJump'),
                onClick: handlePrevJump
            }, [
                tagName ? h('i', {
                    class: ['vxe-pager--jump-more-icon', props.iconJumpMore || GlobalConfig.icon.PAGER_JUMP_MORE]
                }) : null,
                h('i', {
                    class: ['vxe-pager--jump-icon', props.iconJumpPrev || GlobalConfig.icon.PAGER_JUMP_PREV]
                })
            ]);
        };
        // 向下翻页
        var renderNextJump = function (tagName) {
            var pageCount = computePageCount.value;
            return h(tagName || 'button', {
                class: ['vxe-pager--jump-next', {
                        'is--fixed': !tagName,
                        'is--disabled': props.currentPage >= pageCount
                    }],
                type: 'button',
                title: GlobalConfig.i18n('vxe.pager.nextJump'),
                onClick: handleNextJump
            }, [
                tagName ? h('i', {
                    class: ['vxe-pager--jump-more-icon', props.iconJumpMore || GlobalConfig.icon.PAGER_JUMP_MORE]
                }) : null,
                h('i', {
                    class: ['vxe-pager--jump-icon', props.iconJumpNext || GlobalConfig.icon.PAGER_JUMP_NEXT]
                })
            ]);
        };
        // 下一页
        var renderNextPage = function () {
            var pageCount = computePageCount.value;
            return h('button', {
                class: ['vxe-pager--next-btn', {
                        'is--disabled': props.currentPage >= pageCount
                    }],
                type: 'button',
                title: GlobalConfig.i18n('vxe.pager.nextPage'),
                onClick: handleNextPage
            }, [
                h('i', {
                    class: ['vxe-pager--btn-icon', props.iconNextPage || GlobalConfig.icon.PAGER_NEXT_PAGE]
                })
            ]);
        };
        // 页数
        var renderNumber = function (showJump) {
            var currentPage = props.currentPage, pagerCount = props.pagerCount;
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
                }
                else {
                    startNumber = Math.max(currentPage - offsetNumber, 1);
                }
            }
            if (showJump && isLt) {
                nums.push(h('button', {
                    class: 'vxe-pager--num-btn',
                    type: 'button',
                    onClick: function (evnt) { return jumpPageEvent(evnt, 1); }
                }, 1), renderPrevJump('span'));
            }
            numList.forEach(function (item, index) {
                var number = startNumber + index;
                if (number <= pageCount) {
                    nums.push(h('button', {
                        key: number,
                        class: ['vxe-pager--num-btn', {
                                'is--active': currentPage === number
                            }],
                        type: 'button',
                        onClick: function (evnt) { return jumpPageEvent(evnt, number); }
                    }, number));
                }
            });
            if (showJump && isGt) {
                nums.push(renderNextJump('button'), h('button', {
                    class: 'vxe-pager--num-btn',
                    type: 'button',
                    onClick: function (evnt) { return jumpPageEvent(evnt, pageCount); }
                }, pageCount));
            }
            return h('span', {
                class: 'vxe-pager--btn-wrapper'
            }, nums);
        };
        // jumpNumber
        var renderJumpNumber = function () {
            return renderNumber(true);
        };
        // sizes
        var renderSizes = function () {
            var sizeList = computeSizeList.value;
            return h(resolveComponent('vxe-select'), {
                class: 'vxe-pager--sizes',
                modelValue: props.pageSize,
                placement: 'top',
                transfer: props.transfer,
                options: sizeList,
                onChange: pageSizeEvent
            });
        };
        // Jump
        var renderJump = function (isFull) {
            return h('span', {
                class: 'vxe-pager--jump'
            }, [
                isFull ? h('span', {
                    class: 'vxe-pager--goto-text'
                }, GlobalConfig.i18n('vxe.pager.goto')) : null,
                h('input', {
                    class: 'vxe-pager--goto',
                    value: props.currentPage,
                    type: 'text',
                    autocomplete: 'off',
                    onKeydown: jumpKeydownEvent,
                    onBlur: triggerJumpEvent
                }),
                isFull ? h('span', {
                    class: 'vxe-pager--classifier-text'
                }, GlobalConfig.i18n('vxe.pager.pageClassifier')) : null
            ]);
        };
        // FullJump
        var renderFullJump = function () {
            return renderJump(true);
        };
        // PageCount
        var renderPageCount = function () {
            var pageCount = computePageCount.value;
            return h('span', {
                class: 'vxe-pager--count'
            }, [
                h('span', {
                    class: 'vxe-pager--separator'
                }),
                h('span', pageCount)
            ]);
        };
        // total
        var renderTotal = function () {
            return h('span', {
                class: 'vxe-pager--total'
            }, GlobalConfig.i18n('vxe.pager.total', [props.total]));
        };
        pagerMethods = {
            dispatchEvent: function (type, params, evnt) {
                emit(type, Object.assign({ $pager: $xepager, $event: evnt }, params));
            },
            prevPage: function () {
                handlePrevPage();
                return nextTick();
            },
            nextPage: function () {
                handleNextPage();
                return nextTick();
            },
            prevJump: function () {
                handlePrevJump();
                return nextTick();
            },
            nextJump: function () {
                handleNextJump();
                return nextTick();
            }
        };
        pagerPrivateMethods = {
            handlePrevPage: handlePrevPage,
            handleNextPage: handleNextPage,
            handlePrevJump: handlePrevJump,
            handleNextJump: handleNextJump
        };
        Object.assign($xepager, pagerMethods, pagerPrivateMethods);
        var renderVN = function () {
            var _a;
            var align = props.align, layouts = props.layouts, className = props.className;
            var childNodes = [];
            var vSize = computeSize.value;
            var pageCount = computePageCount.value;
            if (slots.left) {
                childNodes.push(h('span', {
                    class: 'vxe-pager--left-wrapper'
                }, slots.left({ $grid: $xegrid })));
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
                childNodes.push(h('span', {
                    class: 'vxe-pager--right-wrapper'
                }, slots.right({ $grid: $xegrid })));
            }
            return h('div', {
                ref: refElem,
                class: ['vxe-pager', className ? (XEUtils.isFunction(className) ? className({ $pager: $xepager }) : className) : '', (_a = {},
                        _a["size--" + vSize] = vSize,
                        _a["align--" + align] = align,
                        _a['is--border'] = props.border,
                        _a['is--background'] = props.background,
                        _a['is--perfect'] = props.perfect,
                        _a['is--hidden'] = props.autoHidden && pageCount === 1,
                        _a['is--loading'] = props.loading,
                        _a)]
            }, [
                h('div', {
                    class: 'vxe-pager--wrapper'
                }, childNodes)
            ]);
        };
        $xepager.renderVN = renderVN;
        return $xepager;
    },
    render: function () {
        return this.renderVN();
    }
});
