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
import { defineComponent, h, onUnmounted, inject, ref, onMounted } from 'vue';
import XEUtils from 'xe-utils';
import GlobalConfig from '../../v-x-e-table/src/conf';
import { VXETable } from '../../v-x-e-table';
import { getFuncText, isEnableConf } from '../../tools/utils';
import { createItem, watchItem, destroyItem, assemItem } from './util';
import { renderTitle } from './render';
export var formItemProps = {
    title: String,
    field: String,
    span: [String, Number],
    align: String,
    titleAlign: String,
    titleWidth: [String, Number],
    className: [String, Function],
    titleOverflow: { type: [Boolean, String], default: null },
    titlePrefix: Object,
    titleSuffix: Object,
    resetValue: { default: null },
    visibleMethod: Function,
    visible: { type: Boolean, default: null },
    folding: Boolean,
    collapseNode: Boolean,
    itemRender: Object
};
export default defineComponent({
    name: 'VxeFormItem',
    props: formItemProps,
    setup: function (props, _a) {
        var slots = _a.slots;
        var refElem = ref();
        var $xeform = inject('$xeform', {});
        var formGather = inject('xeformgather', null);
        var formItem = createItem($xeform, props);
        formItem.slots = slots;
        watchItem(props, formItem);
        onMounted(function () {
            assemItem($xeform, refElem.value, formItem, formGather);
        });
        onUnmounted(function () {
            destroyItem($xeform, formItem);
        });
        var renderItem = function ($xeform, item) {
            var props = $xeform.props, reactData = $xeform.reactData;
            var data = props.data, rules = props.rules, allTitleOverflow = props.titleOverflow;
            var collapseAll = reactData.collapseAll;
            var computeValidOpts = $xeform.getComputeMaps().computeValidOpts;
            var validOpts = computeValidOpts.value;
            var slots = item.slots, title = item.title, visible = item.visible, folding = item.folding, visibleMethod = item.visibleMethod, field = item.field, collapseNode = item.collapseNode, itemRender = item.itemRender, showError = item.showError, errRule = item.errRule, className = item.className, titleOverflow = item.titleOverflow;
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
            var isRequired = false;
            if (rules) {
                var itemRules = rules[field];
                if (itemRules) {
                    isRequired = itemRules.some(function (rule) { return rule.required; });
                }
            }
            if (!itemVisibleMethod && compConf && compConf.itemVisibleMethod) {
                itemVisibleMethod = compConf.itemVisibleMethod;
            }
            var contentVNs = [];
            if (defaultSlot) {
                contentVNs = $xeform.callSlot(defaultSlot, params);
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
                    onClick: $xeform.toggleCollapseEvent
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
                    $xeform.triggerHeaderHelpEvent(evnt, params);
                },
                onMouseleave: $xeform.handleTargetLeaveEvent
            } : {};
            return h('div', {
                ref: refElem,
                class: ['vxe-form--item', item.id, span ? "vxe-col--" + span + " is--span" : '', className ? (XEUtils.isFunction(className) ? className(params) : className) : '', {
                        'is--title': title,
                        'is--required': isRequired,
                        'is--hidden': visible === false || (folding && collapseAll),
                        'is--active': !itemVisibleMethod || itemVisibleMethod(params),
                        'is--error': showError
                    }]
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
        };
        var renderVN = function () {
            var formProps = $xeform ? $xeform.props : null;
            return formProps && formProps.customLayout ? renderItem($xeform, formItem) : h('div', {
                ref: refElem
            });
        };
        return renderVN;
    }
});
