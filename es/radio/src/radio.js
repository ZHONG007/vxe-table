import { defineComponent, h, computed, inject } from 'vue';
import XEUtils from 'xe-utils';
import { getFuncText } from '../../tools/utils';
import GlobalConfig from '../../v-x-e-table/src/conf';
import { useSize } from '../../hooks/size';
export default defineComponent({
    name: 'VxeRadio',
    props: {
        modelValue: [String, Number, Boolean],
        label: { type: [String, Number, Boolean], default: null },
        title: [String, Number],
        content: [String, Number],
        disabled: Boolean,
        name: String,
        size: { type: String, default: function () { return GlobalConfig.radio.size || GlobalConfig.size; } }
    },
    emits: [
        'update:modelValue',
        'change'
    ],
    setup: function (props, context) {
        var slots = context.slots, emit = context.emit;
        var xID = XEUtils.uniqueId();
        var $xeradio = {
            xID: xID,
            props: props,
            context: context
        };
        var computeSize = useSize(props);
        var $xeradiogroup = inject('$xeradiogroup', null);
        var radioMethods = {};
        var computeDisabled = computed(function () {
            return props.disabled || ($xeradiogroup && $xeradiogroup.props.disabled);
        });
        var computeName = computed(function () {
            return $xeradiogroup ? $xeradiogroup.name : props.name;
        });
        var computeChecked = computed(function () {
            var modelValue = props.modelValue, label = props.label;
            return $xeradiogroup ? $xeradiogroup.props.modelValue === label : modelValue === label;
        });
        var changeEvent = function (evnt) {
            var label = props.label;
            var isDisabled = computeDisabled.value;
            if (!isDisabled) {
                if ($xeradiogroup) {
                    $xeradiogroup.handleChecked({ label: label }, evnt);
                }
                else {
                    emit('update:modelValue', label);
                    radioMethods.dispatchEvent('change', { label: label }, evnt);
                }
            }
        };
        radioMethods = {
            dispatchEvent: function (type, params, evnt) {
                emit(type, Object.assign({ $radio: $xeradio, $event: evnt }, params));
            }
        };
        Object.assign($xeradio, radioMethods);
        var renderVN = function () {
            var _a;
            var vSize = computeSize.value;
            var isDisabled = computeDisabled.value;
            var name = computeName.value;
            var checked = computeChecked.value;
            return h('label', {
                class: ['vxe-radio', (_a = {},
                        _a["size--" + vSize] = vSize,
                        _a['is--disabled'] = isDisabled,
                        _a)],
                title: props.title
            }, [
                h('input', {
                    class: 'vxe-radio--input',
                    type: 'radio',
                    name: name,
                    checked: checked,
                    disabled: isDisabled,
                    onChange: changeEvent
                }),
                h('span', {
                    class: 'vxe-radio--icon'
                }),
                h('span', {
                    class: 'vxe-radio--label'
                }, slots.default ? slots.default({}) : getFuncText(props.content))
            ]);
        };
        $xeradio.renderVN = renderVN;
        return $xeradio;
    },
    render: function () {
        return this.renderVN();
    }
});
