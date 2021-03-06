import { watch } from 'vue';
import XEUtils from 'xe-utils';
import { ItemInfo } from './itemInfo';
export function isFormItem(item) {
    return item instanceof ItemInfo;
}
export function createItem($xeform, _vm) {
    return isFormItem(_vm) ? _vm : new ItemInfo($xeform, _vm);
}
export function watchItem(props, formItem) {
    Object.keys(props).forEach(function (name) {
        watch(function () { return props[name]; }, function (value) {
            formItem.update(name, value);
        });
    });
}
export function assemItem($xeform, el, formItem, formGather) {
    var reactData = $xeform.reactData;
    var staticItems = reactData.staticItems;
    var parentElem = el.parentNode;
    var parentItem = formGather ? formGather.formItem : null;
    var parentItems = parentItem ? parentItem.children : staticItems;
    if (parentElem) {
        parentItems.splice(XEUtils.arrayIndexOf(parentElem.children, el), 0, formItem);
        reactData.staticItems = staticItems.slice(0);
    }
}
export function destroyItem($xeform, formItem) {
    var reactData = $xeform.reactData;
    var staticItems = reactData.staticItems;
    var index = XEUtils.findIndexOf(staticItems, function (item) { return item.id === formItem.id; });
    if (index > -1) {
        staticItems.splice(index, 1);
    }
    reactData.staticItems = staticItems.slice(0);
}
