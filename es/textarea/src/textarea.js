import { defineComponent, h, ref, computed, nextTick, watch, reactive } from 'vue';
import XEUtils from 'xe-utils';
import GlobalConfig from '../../v-x-e-table/src/conf';
import { getFuncText } from '../../tools/utils';
import { useSize } from '../../hooks/size';
var autoTxtElem;
export default defineComponent({
    name: 'VxeTextarea',
    props: {
        modelValue: [String, Number],
        className: String,
        immediate: { type: Boolean, default: true },
        name: String,
        readonly: Boolean,
        disabled: Boolean,
        placeholder: String,
        maxlength: [String, Number],
        rows: { type: [String, Number], default: 2 },
        cols: { type: [String, Number], default: null },
        showWordCount: Boolean,
        countMethod: Function,
        autosize: [Boolean, Object],
        form: String,
        resize: { type: String, default: function () { return GlobalConfig.textarea.resize; } },
        size: { type: String, default: function () { return GlobalConfig.textarea.size || GlobalConfig.size; } }
    },
    emits: [
        'update:modelValue',
        'input',
        'keydown',
        'keyup',
        'click',
        'change',
        'focus',
        'blur'
    ],
    setup: function (props, context) {
        var emit = context.emit;
        var xID = XEUtils.uniqueId();
        var computeSize = useSize(props);
        var reactData = reactive({
            inputValue: props.modelValue
        });
        var refElem = ref();
        var refTextarea = ref();
        var refMaps = {
            refElem: refElem,
            refTextarea: refTextarea
        };
        var $xetextarea = {
            xID: xID,
            props: props,
            context: context,
            reactData: reactData,
            getRefMaps: function () { return refMaps; }
        };
        var textareaMethods = {};
        var computeInputCount = computed(function () {
            return XEUtils.getSize(reactData.inputValue);
        });
        var computeIsCountError = computed(function () {
            var inputCount = computeInputCount.value;
            return props.maxlength && inputCount > XEUtils.toNumber(props.maxlength);
        });
        var computeSizeOpts = computed(function () {
            return Object.assign({ minRows: 1, maxRows: 10 }, GlobalConfig.textarea.autosize, props.autosize);
        });
        var updateAutoTxt = function () {
            var size = props.size, autosize = props.autosize;
            var inputValue = reactData.inputValue;
            if (autosize) {
                if (!autoTxtElem) {
                    autoTxtElem = document.createElement('div');
                }
                if (!autoTxtElem.parentNode) {
                    document.body.appendChild(autoTxtElem);
                }
                var textElem = refTextarea.value;
                var textStyle = getComputedStyle(textElem);
                autoTxtElem.className = ['vxe-textarea--autosize', size ? "size--" + size : ''].join(' ');
                autoTxtElem.style.width = textElem.clientWidth + "px";
                autoTxtElem.style.padding = textStyle.padding;
                autoTxtElem.innerHTML = ('' + (inputValue || '???')).replace(/\n$/, '\n???');
            }
        };
        var handleResize = function () {
            if (props.autosize) {
                nextTick(function () {
                    var sizeOpts = computeSizeOpts.value;
                    var minRows = sizeOpts.minRows, maxRows = sizeOpts.maxRows;
                    var textElem = refTextarea.value;
                    var sizeHeight = autoTxtElem.clientHeight;
                    var textStyle = getComputedStyle(textElem);
                    var lineHeight = XEUtils.toNumber(textStyle.lineHeight);
                    var paddingTop = XEUtils.toNumber(textStyle.paddingTop);
                    var paddingBottom = XEUtils.toNumber(textStyle.paddingBottom);
                    var borderTopWidth = XEUtils.toNumber(textStyle.borderTopWidth);
                    var borderBottomWidth = XEUtils.toNumber(textStyle.borderBottomWidth);
                    var intervalHeight = paddingTop + paddingBottom + borderTopWidth + borderBottomWidth;
                    var rowNum = (sizeHeight - intervalHeight) / lineHeight;
                    var textRows = rowNum && /[0-9]/.test('' + rowNum) ? rowNum : Math.floor(rowNum) + 1;
                    var vaildRows = textRows;
                    if (textRows < minRows) {
                        vaildRows = minRows;
                    }
                    else if (textRows > maxRows) {
                        vaildRows = maxRows;
                    }
                    textElem.style.height = (vaildRows * lineHeight) + intervalHeight + "px";
                });
            }
        };
        var triggerEvent = function (evnt) {
            var value = reactData.inputValue;
            $xetextarea.dispatchEvent(evnt.type, { value: value }, evnt);
        };
        var emitUpdate = function (value, evnt) {
            reactData.inputValue = value;
            emit('update:modelValue', value);
            if (XEUtils.toValueString(props.modelValue) !== value) {
                textareaMethods.dispatchEvent('change', { value: value }, evnt);
            }
        };
        var inputEvent = function (evnt) {
            var immediate = props.immediate;
            var textElem = evnt.target;
            var value = textElem.value;
            reactData.inputValue = value;
            if (immediate) {
                emitUpdate(value, evnt);
            }
            $xetextarea.dispatchEvent('input', { value: value }, evnt);
            handleResize();
        };
        var changeEvent = function (evnt) {
            var immediate = props.immediate;
            if (immediate) {
                triggerEvent(evnt);
            }
            else {
                emitUpdate(reactData.inputValue, evnt);
            }
        };
        var blurEvent = function (evnt) {
            var immediate = props.immediate;
            var inputValue = reactData.inputValue;
            if (!immediate) {
                emitUpdate(inputValue, evnt);
            }
            $xetextarea.dispatchEvent('blur', { value: inputValue }, evnt);
        };
        textareaMethods = {
            dispatchEvent: function (type, params, evnt) {
                emit(type, Object.assign({ $textarea: $xetextarea, $event: evnt }, params));
            },
            focus: function () {
                var textElem = refTextarea.value;
                textElem.focus();
                return nextTick();
            },
            blur: function () {
                var textElem = refTextarea.value;
                textElem.blur();
                return nextTick();
            }
        };
        Object.assign($xetextarea, textareaMethods);
        watch(function () { return props.modelValue; }, function (val) {
            reactData.inputValue = val;
            updateAutoTxt();
        });
        nextTick(function () {
            var autosize = props.autosize;
            if (autosize) {
                updateAutoTxt();
                handleResize();
            }
        });
        var renderVN = function () {
            var _a;
            var className = props.className, resize = props.resize, placeholder = props.placeholder, disabled = props.disabled, maxlength = props.maxlength, autosize = props.autosize, showWordCount = props.showWordCount, countMethod = props.countMethod, rows = props.rows, cols = props.cols;
            var inputValue = reactData.inputValue;
            var vSize = computeSize.value;
            var isCountError = computeIsCountError.value;
            var inputCount = computeInputCount.value;
            return h('div', {
                ref: refElem,
                class: ['vxe-textarea', className, (_a = {},
                        _a["size--" + vSize] = vSize,
                        _a['is--autosize'] = autosize,
                        _a['is--disabled'] = disabled,
                        _a['def--rows'] = !XEUtils.eqNull(rows),
                        _a['def--cols'] = !XEUtils.eqNull(cols),
                        _a)]
            }, [
                h('textarea', {
                    ref: refTextarea,
                    class: 'vxe-textarea--inner',
                    value: inputValue,
                    name: props.name,
                    placeholder: placeholder ? getFuncText(placeholder) : null,
                    maxlength: maxlength,
                    readonly: props.readonly,
                    disabled: disabled,
                    rows: rows,
                    cols: cols,
                    style: resize ? {
                        resize: resize
                    } : null,
                    onInput: inputEvent,
                    onChange: changeEvent,
                    onKeydown: triggerEvent,
                    onKeyup: triggerEvent,
                    onClick: triggerEvent,
                    onFocus: triggerEvent,
                    onBlur: blurEvent
                }),
                showWordCount ? h('span', {
                    class: ['vxe-textarea--count', {
                            'is--error': isCountError
                        }]
                }, countMethod ? "" + countMethod({ value: inputValue }) : "" + inputCount + (maxlength ? "/" + maxlength : '')) : null
            ]);
        };
        $xetextarea.renderVN = renderVN;
        return $xetextarea;
    },
    render: function () {
        return this.renderVN();
    }
});
