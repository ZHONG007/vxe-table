import { defineComponent, h, ref, computed, reactive, nextTick, createCommentVNode } from 'vue';
import XEUtils from 'xe-utils';
import GlobalConfig from '../../v-x-e-table/src/conf';
import { useSize } from '../../hooks/size';
import { getFuncText } from '../../tools/utils';
export default defineComponent({
    name: 'VxeSwitch',
    props: {
        modelValue: [String, Number, Boolean],
        disabled: Boolean,
        size: { type: String, default: function () { return GlobalConfig.switch.size || GlobalConfig.size; } },
        openLabel: String,
        closeLabel: String,
        openValue: { type: [String, Number, Boolean], default: true },
        closeValue: { type: [String, Number, Boolean], default: false },
        openIcon: String,
        closeIcon: String
    },
    emits: [
        'update:modelValue',
        'change',
        'focus',
        'blur'
    ],
    setup: function (props, context) {
        var emit = context.emit;
        var xID = XEUtils.uniqueId();
        var computeSize = useSize(props);
        var reactData = reactive({
            isActivated: false,
            hasAnimat: false,
            offsetLeft: 0
        });
        var $xeswitch = {
            xID: xID,
            props: props,
            context: context,
            reactData: reactData
        };
        var refButton = ref();
        var switchMethods = {};
        var computeOnShowLabel = computed(function () {
            return getFuncText(props.openLabel);
        });
        var computeOffShowLabel = computed(function () {
            return getFuncText(props.closeLabel);
        });
        var computeIsChecked = computed(function () {
            return props.modelValue === props.openValue;
        });
        var _atimeout;
        var clickEvent = function (evnt) {
            if (!props.disabled) {
                var isChecked = computeIsChecked.value;
                clearTimeout(_atimeout);
                var value = isChecked ? props.closeValue : props.openValue;
                reactData.hasAnimat = true;
                emit('update:modelValue', value);
                switchMethods.dispatchEvent('change', { value: value }, evnt);
                _atimeout = setTimeout(function () {
                    reactData.hasAnimat = false;
                }, 400);
            }
        };
        var focusEvent = function (evnt) {
            reactData.isActivated = true;
            switchMethods.dispatchEvent('focus', { value: props.modelValue }, evnt);
        };
        var blurEvent = function (evnt) {
            reactData.isActivated = false;
            switchMethods.dispatchEvent('blur', { value: props.modelValue }, evnt);
        };
        switchMethods = {
            dispatchEvent: function (type, params, evnt) {
                emit(type, Object.assign({ $switch: $xeswitch, $event: evnt }, params));
            },
            focus: function () {
                var btnElem = refButton.value;
                reactData.isActivated = true;
                btnElem.focus();
                return nextTick();
            },
            blur: function () {
                var btnElem = refButton.value;
                btnElem.blur();
                reactData.isActivated = false;
                return nextTick();
            }
        };
        Object.assign($xeswitch, switchMethods);
        var renderVN = function () {
            var _a;
            var disabled = props.disabled, openIcon = props.openIcon, closeIcon = props.closeIcon;
            var isChecked = computeIsChecked.value;
            var vSize = computeSize.value;
            var onShowLabel = computeOnShowLabel.value;
            var offShowLabel = computeOffShowLabel.value;
            return h('div', {
                class: ['vxe-switch', isChecked ? 'is--on' : 'is--off', (_a = {},
                        _a["size--" + vSize] = vSize,
                        _a['is--disabled'] = disabled,
                        _a['is--animat'] = reactData.hasAnimat,
                        _a)]
            }, [
                h('button', {
                    ref: refButton,
                    class: 'vxe-switch--button',
                    type: 'button',
                    disabled: disabled,
                    onClick: clickEvent,
                    onFocus: focusEvent,
                    onBlur: blurEvent
                }, [
                    h('span', {
                        class: 'vxe-switch--label vxe-switch--label-on'
                    }, [
                        openIcon ? h('i', {
                            class: ['vxe-switch--label-icon', openIcon]
                        }) : createCommentVNode(),
                        onShowLabel
                    ]),
                    h('span', {
                        class: 'vxe-switch--label vxe-switch--label-off'
                    }, [
                        closeIcon ? h('i', {
                            class: ['vxe-switch--label-icon', closeIcon]
                        }) : createCommentVNode(),
                        offShowLabel
                    ]),
                    h('span', {
                        class: 'vxe-switch--icon'
                    })
                ])
            ]);
        };
        $xeswitch.renderVN = renderVN;
        return $xeswitch;
    },
    render: function () {
        return this.renderVN();
    }
});
