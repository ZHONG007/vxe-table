import { defineComponent, h, onUnmounted, inject, ref, onMounted, provide, nextTick } from 'vue';
import { errLog } from '../../tools/utils';
import { createItem, watchItem, destroyItem, assemItem } from './util';
import { formItemProps } from './form-item';
export default defineComponent({
    name: 'VxeFormGather',
    props: formItemProps,
    setup: function (props, _a) {
        var slots = _a.slots;
        var refElem = ref();
        var $xeform = inject('$xeform', {});
        var formGather = inject('xeformgather', null);
        var defaultSlot = slots.default;
        var formItem = createItem($xeform, props);
        var xeformitem = { formItem: formItem };
        formItem.children = [];
        provide('xeformgather', xeformitem);
        watchItem(props, formItem);
        onMounted(function () {
            assemItem($xeform, refElem.value, formItem, formGather);
        });
        onUnmounted(function () {
            destroyItem($xeform, formItem);
        });
        if (process.env.NODE_ENV === 'development') {
            nextTick(function () {
                if ($xeform && $xeform.props.customLayout) {
                    errLog('vxe.error.errConflicts', ['custom-layout', '<form-gather ...>']);
                }
            });
        }
        var renderVN = function () {
            return h('div', {
                ref: refElem
            }, defaultSlot ? defaultSlot() : []);
        };
        return renderVN;
    }
});
