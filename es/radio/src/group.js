import { defineComponent, h, provide } from 'vue';
import XEUtils from 'xe-utils';
import GlobalConfig from '../../v-x-e-table/src/conf';
import { useSize } from '../../hooks/size';
export default defineComponent({
    name: 'VxeRadioGroup',
    props: {
        modelValue: [String, Number, Boolean],
        disabled: Boolean,
        size: { type: String, default: function () { return GlobalConfig.radio.size || GlobalConfig.size; } }
    },
    emits: [
        'update:modelValue',
        'change'
    ],
    setup: function (props, context) {
        var slots = context.slots, emit = context.emit;
        var xID = XEUtils.uniqueId();
        var $xeradiogroup = {
            xID: xID,
            props: props,
            context: context,
            name: XEUtils.uniqueId('xegroup_')
        };
        var radioGroupMethods = {};
        useSize(props);
        var radioGroupPrivateMethods = {
            handleChecked: function (params) {
                emit('update:modelValue', params.label);
                radioGroupMethods.dispatchEvent('change', params);
            }
        };
        radioGroupMethods = {
            dispatchEvent: function (type, params, evnt) {
                emit(type, Object.assign({ $radioGroup: $xeradiogroup, $event: evnt }, params));
            }
        };
        var renderVN = function () {
            return h('div', {
                class: 'vxe-radio-group'
            }, slots.default ? slots.default({}) : []);
        };
        Object.assign($xeradiogroup, radioGroupPrivateMethods, {
            renderVN: renderVN,
            dispatchEvent: dispatchEvent
        });
        provide('$xeradiogroup', $xeradiogroup);
        return renderVN;
    }
});
