import { h, resolveComponent } from 'vue';
import GlobalConfig from '../../v-x-e-table/src/conf';
import { VXETable } from '../../v-x-e-table';
import { getFuncText, isEnableConf } from '../../tools/utils';
function renderPrefixIcon(titlePrefix) {
    return h('span', {
        class: 'vxe-form--item-title-prefix'
    }, [
        h('i', {
            class: titlePrefix.icon || GlobalConfig.icon.FORM_PREFIX
        })
    ]);
}
function renderSuffixIcon(titleSuffix) {
    return h('span', {
        class: 'vxe-form--item-title-suffix'
    }, [
        h('i', {
            class: titleSuffix.icon || GlobalConfig.icon.FORM_SUFFIX
        })
    ]);
}
export function renderTitle($xeform, item) {
    var data = $xeform.props.data;
    var slots = item.slots, field = item.field, itemRender = item.itemRender, titlePrefix = item.titlePrefix, titleSuffix = item.titleSuffix;
    var compConf = isEnableConf(itemRender) ? VXETable.renderer.get(itemRender.name) : null;
    var params = { data: data, property: field, item: item, $form: $xeform };
    var titleSlot = slots ? slots.title : null;
    var contVNs = [];
    var titVNs = [];
    if (titlePrefix) {
        titVNs.push(titlePrefix.message
            ? h(resolveComponent('vxe-tooltip'), {
                content: getFuncText(titlePrefix.message),
                enterable: titlePrefix.enterable,
                theme: titlePrefix.theme
            }, {
                default: function () { return renderPrefixIcon(titlePrefix); }
            })
            : renderPrefixIcon(titlePrefix));
    }
    titVNs.push(h('span', {
        class: 'vxe-form--item-title-label'
    }, compConf && compConf.renderItemTitle ? compConf.renderItemTitle(itemRender, params) : (titleSlot ? $xeform.callSlot(titleSlot, params) : getFuncText(item.title))));
    contVNs.push(h('div', {
        class: 'vxe-form--item-title-content'
    }, titVNs));
    var fixVNs = [];
    if (titleSuffix) {
        fixVNs.push(titleSuffix.message
            ? h(resolveComponent('vxe-tooltip'), {
                content: getFuncText(titleSuffix.message),
                enterable: titleSuffix.enterable,
                theme: titleSuffix.theme
            }, {
                default: function () { return renderSuffixIcon(titleSuffix); }
            })
            : renderSuffixIcon(titleSuffix));
    }
    contVNs.push(h('div', {
        class: 'vxe-form--item-title-postfix'
    }, fixVNs));
    return contVNs;
}
