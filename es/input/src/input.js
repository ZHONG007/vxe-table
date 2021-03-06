import { defineComponent, h, Teleport, ref, computed, reactive, nextTick, watch, onUnmounted } from 'vue';
import XEUtils from 'xe-utils';
import GlobalConfig from '../../v-x-e-table/src/conf';
import { useSize } from '../../hooks/size';
import { getFuncText, getLastZIndex, nextZIndex } from '../../tools/utils';
import { hasClass, getAbsolutePos, getEventTargetNode } from '../../tools/dom';
import { GlobalEvent, hasEventKey, EVENT_KEYS } from '../../tools/event';
var yearSize = 20;
var monthSize = 20;
var quarterSize = 8;
function toStringTimeDate(str) {
    if (str) {
        var rest = new Date();
        var h_1 = 0;
        var m = 0;
        var s = 0;
        if (XEUtils.isDate(str)) {
            h_1 = str.getHours();
            m = str.getMinutes();
            s = str.getSeconds();
        }
        else {
            str = XEUtils.toValueString(str);
            var parses = str.match(/^(\d{1,2})(:(\d{1,2}))?(:(\d{1,2}))?/);
            if (parses) {
                h_1 = XEUtils.toNumber(parses[1]);
                m = XEUtils.toNumber(parses[3]);
                s = XEUtils.toNumber(parses[5]);
            }
        }
        rest.setHours(h_1);
        rest.setMinutes(m);
        rest.setSeconds(s);
        return rest;
    }
    return new Date('');
}
export default defineComponent({
    name: 'VxeInput',
    props: {
        modelValue: [String, Number, Date],
        immediate: { type: Boolean, default: true },
        name: String,
        type: { type: String, default: 'text' },
        clearable: { type: Boolean, default: function () { return GlobalConfig.input.clearable; } },
        readonly: Boolean,
        disabled: Boolean,
        placeholder: String,
        maxlength: [String, Number],
        autocomplete: { type: String, default: 'off' },
        align: String,
        form: String,
        className: String,
        size: { type: String, default: function () { return GlobalConfig.input.size || GlobalConfig.size; } },
        // number、integer、float
        min: { type: [String, Number], default: null },
        max: { type: [String, Number], default: null },
        step: [String, Number],
        exponential: { type: Boolean, default: function () { return GlobalConfig.input.exponential; } },
        // number、integer、float、password
        controls: { type: Boolean, default: function () { return GlobalConfig.input.controls; } },
        // float
        digits: { type: [String, Number], default: function () { return GlobalConfig.input.digits; } },
        // date、week、month、quarter、year
        minDate: { type: [String, Number, Date], default: function () { return GlobalConfig.input.minDate; } },
        maxDate: { type: [String, Number, Date], default: function () { return GlobalConfig.input.maxDate; } },
        // 已废弃 startWeek，被 startDay 替换
        startWeek: Number,
        startDay: { type: [String, Number], default: function () { return GlobalConfig.input.startDay; } },
        labelFormat: { type: String, default: function () { return GlobalConfig.input.labelFormat; } },
        valueFormat: { type: String, default: function () { return GlobalConfig.input.valueFormat; } },
        editable: { type: Boolean, default: true },
        festivalMethod: { type: Function, default: function () { return GlobalConfig.input.festivalMethod; } },
        disabledMethod: { type: Function, default: function () { return GlobalConfig.input.disabledMethod; } },
        // week
        selectDay: { type: [String, Number], default: function () { return GlobalConfig.input.selectDay; } },
        prefixIcon: String,
        suffixIcon: String,
        placement: String,
        transfer: { type: Boolean, default: function () { return GlobalConfig.input.transfer; } }
    },
    emits: [
        'update:modelValue',
        'input',
        'change',
        'keydown',
        'keyup',
        'wheel',
        'click',
        'focus',
        'blur',
        'clear',
        'search-click',
        'toggle-visible',
        'prev-number',
        'next-number',
        'prefix-click',
        'suffix-click',
        'date-prev',
        'date-today',
        'date-next'
    ],
    setup: function (props, context) {
        var slots = context.slots, emit = context.emit;
        var xID = XEUtils.uniqueId();
        var computeSize = useSize(props);
        var reactData = reactive({
            inited: false,
            panelIndex: 0,
            showPwd: false,
            visiblePanel: false,
            animatVisible: false,
            panelStyle: null,
            panelPlacement: '',
            isActivated: false,
            inputValue: props.modelValue,
            datetimePanelValue: null,
            datePanelValue: null,
            datePanelLabel: '',
            datePanelType: 'day',
            selectMonth: null,
            currentDate: null
        });
        var refElem = ref();
        var refInputTarget = ref();
        var refInputPanel = ref();
        var refInputTimeBody = ref();
        var refMaps = {
            refElem: refElem,
            refInput: refInputTarget
        };
        var $xeinput = {
            xID: xID,
            props: props,
            context: context,
            reactData: reactData,
            getRefMaps: function () { return refMaps; }
        };
        var inputMethods = {};
        var computeIsDateTimeType = computed(function () {
            var type = props.type;
            return type === 'time' || type === 'datetime';
        });
        var computeIsNumType = computed(function () {
            return ['number', 'integer', 'float'].indexOf(props.type) > -1;
        });
        var computeIsDatePickerType = computed(function () {
            var isDateTimeType = computeIsDateTimeType.value;
            return isDateTimeType || ['date', 'week', 'month', 'quarter', 'year'].indexOf(props.type) > -1;
        });
        var computeIsPawdType = computed(function () {
            return props.type === 'password';
        });
        var computeIsSearchType = computed(function () {
            return props.type === 'search';
        });
        var computeDigitsValue = computed(function () {
            return XEUtils.toInteger(props.digits) || 1;
        });
        var computeStepValue = computed(function () {
            var type = props.type;
            var digitsValue = computeDigitsValue.value;
            var step = props.step;
            if (type === 'integer') {
                return XEUtils.toInteger(step) || 1;
            }
            else if (type === 'float') {
                return XEUtils.toNumber(step) || (1 / Math.pow(10, digitsValue));
            }
            return XEUtils.toNumber(step) || 1;
        });
        var computeIsClearable = computed(function () {
            var type = props.type;
            var isNumType = computeIsNumType.value;
            var isDatePickerType = computeIsDatePickerType.value;
            var isPawdType = computeIsPawdType.value;
            return props.clearable && (isPawdType || isNumType || isDatePickerType || type === 'text' || type === 'search');
        });
        var computeDateMinTime = computed(function () {
            return props.minDate ? XEUtils.toStringDate(props.minDate) : null;
        });
        var computeDateMaxTime = computed(function () {
            return props.maxDate ? XEUtils.toStringDate(props.maxDate) : null;
        });
        var computeDateValueFormat = computed(function () {
            var type = props.type;
            return type === 'time' ? 'HH:mm:ss' : (props.valueFormat || (type === 'datetime' ? 'yyyy-MM-dd HH:mm:ss' : 'yyyy-MM-dd'));
        });
        var computeDateValue = computed(function () {
            var modelValue = props.modelValue, type = props.type;
            var isDatePickerType = computeIsDatePickerType.value;
            var dateValueFormat = computeDateValueFormat.value;
            var val = null;
            if (modelValue && isDatePickerType) {
                var date = void 0;
                if (type === 'time') {
                    date = toStringTimeDate(modelValue);
                }
                else {
                    date = XEUtils.toStringDate(modelValue, dateValueFormat);
                }
                if (XEUtils.isValidDate(date)) {
                    val = date;
                }
            }
            return val;
        });
        var computeIsDisabledPrevDateBtn = computed(function () {
            var dateMinTime = computeDateMinTime.value;
            var selectMonth = reactData.selectMonth;
            if (selectMonth && dateMinTime) {
                return selectMonth <= dateMinTime;
            }
            return false;
        });
        var computeIsDisabledNextDateBtn = computed(function () {
            var dateMaxTime = computeDateMaxTime.value;
            var selectMonth = reactData.selectMonth;
            if (selectMonth && dateMaxTime) {
                return selectMonth >= dateMaxTime;
            }
            return false;
        });
        var computeDateTimeLabel = computed(function () {
            var datetimePanelValue = reactData.datetimePanelValue;
            if (datetimePanelValue) {
                return XEUtils.toDateString(datetimePanelValue, 'HH:mm:ss');
            }
            return '';
        });
        var computeDateHMSTime = computed(function () {
            var dateValue = computeDateValue.value;
            var isDateTimeType = computeIsDateTimeType.value;
            return dateValue && isDateTimeType ? (dateValue.getHours() * 3600 + dateValue.getMinutes() * 60 + dateValue.getSeconds()) * 1000 : 0;
        });
        var computeDateLabelFormat = computed(function () {
            var isDatePickerType = computeIsDatePickerType.value;
            if (isDatePickerType) {
                return props.labelFormat || GlobalConfig.i18n("vxe.input.date.labelFormat." + props.type);
            }
            return null;
        });
        var computeYearList = computed(function () {
            var selectMonth = reactData.selectMonth, currentDate = reactData.currentDate;
            var years = [];
            if (selectMonth && currentDate) {
                var currFullYear = currentDate.getFullYear();
                var startYear = new Date(XEUtils.toNumber(('' + selectMonth.getFullYear()).replace(/\d{1}$/, '0')), 0, 1);
                for (var index = -10; index < yearSize - 10; index++) {
                    var date = XEUtils.getWhatYear(startYear, index, 'first');
                    var itemFullYear = date.getFullYear();
                    years.push({
                        date: date,
                        isCurrent: true,
                        isNow: currFullYear === itemFullYear,
                        year: itemFullYear
                    });
                }
            }
            return years;
        });
        var computeSelectDatePanelLabel = computed(function () {
            var isDatePickerType = computeIsDatePickerType.value;
            if (isDatePickerType) {
                var datePanelType = reactData.datePanelType, selectMonth = reactData.selectMonth;
                var yearList = computeYearList.value;
                var year = '';
                var month = void 0;
                if (selectMonth) {
                    year = selectMonth.getFullYear();
                    month = selectMonth.getMonth() + 1;
                }
                if (datePanelType === 'quarter') {
                    return GlobalConfig.i18n('vxe.input.date.quarterLabel', [year]);
                }
                else if (datePanelType === 'month') {
                    return GlobalConfig.i18n('vxe.input.date.monthLabel', [year]);
                }
                else if (datePanelType === 'year') {
                    return yearList.length ? yearList[0].year + " - " + yearList[yearList.length - 1].year : '';
                }
                return GlobalConfig.i18n('vxe.input.date.dayLabel', [year, month ? GlobalConfig.i18n("vxe.input.date.m" + month) : '-']);
            }
            return '';
        });
        var computeWeekDatas = computed(function () {
            var weeks = [];
            var isDatePickerType = computeIsDatePickerType.value;
            if (isDatePickerType) {
                var startDay = props.startDay, startWeek = props.startWeek;
                var sWeek = XEUtils.toNumber(XEUtils.isNumber(startDay) || XEUtils.isString(startDay) ? startDay : startWeek);
                weeks.push(sWeek);
                for (var index = 0; index < 6; index++) {
                    if (sWeek >= 6) {
                        sWeek = 0;
                    }
                    else {
                        sWeek++;
                    }
                    weeks.push(sWeek);
                }
            }
            return weeks;
        });
        var computeDateHeaders = computed(function () {
            var isDatePickerType = computeIsDatePickerType.value;
            if (isDatePickerType) {
                var weekDatas = computeWeekDatas.value;
                return weekDatas.map(function (day) {
                    return {
                        value: day,
                        label: GlobalConfig.i18n("vxe.input.date.weeks.w" + day)
                    };
                });
            }
            return [];
        });
        var computeWeekHeaders = computed(function () {
            var isDatePickerType = computeIsDatePickerType.value;
            if (isDatePickerType) {
                var dateHeaders = computeDateHeaders.value;
                return [{ label: GlobalConfig.i18n('vxe.input.date.weeks.w') }].concat(dateHeaders);
            }
            return [];
        });
        var computeYearDatas = computed(function () {
            var yearList = computeYearList.value;
            return XEUtils.chunk(yearList, 4);
        });
        var getDateQuarter = function (date) {
            var month = date.getMonth();
            if (month < 3) {
                return 1;
            }
            else if (month < 6) {
                return 2;
            }
            else if (month < 9) {
                return 3;
            }
            return 4;
        };
        var computeQuarterList = computed(function () {
            var selectMonth = reactData.selectMonth, currentDate = reactData.currentDate;
            var quarters = [];
            if (selectMonth && currentDate) {
                var currFullYear = currentDate.getFullYear();
                var currQuarter = getDateQuarter(currentDate);
                var firstYear = XEUtils.getWhatYear(selectMonth, 0, 'first');
                var selFullYear = firstYear.getFullYear();
                for (var index = -2; index < quarterSize - 2; index++) {
                    var date = XEUtils.getWhatQuarter(firstYear, index);
                    var itemFullYear = date.getFullYear();
                    var itemQuarter = getDateQuarter(date);
                    var isPrev = itemFullYear < selFullYear;
                    quarters.push({
                        date: date,
                        isPrev: isPrev,
                        isCurrent: itemFullYear === selFullYear,
                        isNow: itemFullYear === currFullYear && itemQuarter === currQuarter,
                        isNext: !isPrev && itemFullYear > selFullYear,
                        quarter: itemQuarter
                    });
                }
            }
            return quarters;
        });
        var computeQuarterDatas = computed(function () {
            var quarterList = computeQuarterList.value;
            return XEUtils.chunk(quarterList, 2);
        });
        var computeMonthList = computed(function () {
            var selectMonth = reactData.selectMonth, currentDate = reactData.currentDate;
            var months = [];
            if (selectMonth && currentDate) {
                var currFullYear = currentDate.getFullYear();
                var currMonth = currentDate.getMonth();
                var selFullYear = XEUtils.getWhatYear(selectMonth, 0, 'first').getFullYear();
                for (var index = -4; index < monthSize - 4; index++) {
                    var date = XEUtils.getWhatYear(selectMonth, 0, index);
                    var itemFullYear = date.getFullYear();
                    var itemMonth = date.getMonth();
                    var isPrev = itemFullYear < selFullYear;
                    months.push({
                        date: date,
                        isPrev: isPrev,
                        isCurrent: itemFullYear === selFullYear,
                        isNow: itemFullYear === currFullYear && itemMonth === currMonth,
                        isNext: !isPrev && itemFullYear > selFullYear,
                        month: itemMonth
                    });
                }
            }
            return months;
        });
        var computeMonthDatas = computed(function () {
            var monthList = computeMonthList.value;
            return XEUtils.chunk(monthList, 4);
        });
        var computeDayList = computed(function () {
            var selectMonth = reactData.selectMonth, currentDate = reactData.currentDate;
            var days = [];
            if (selectMonth && currentDate) {
                var dateHMSTime = computeDateHMSTime.value;
                var weekDatas = computeWeekDatas.value;
                var currFullYear = currentDate.getFullYear();
                var currMonth = currentDate.getMonth();
                var currDate = currentDate.getDate();
                var selFullYear = selectMonth.getFullYear();
                var selMonth = selectMonth.getMonth();
                var selDay = selectMonth.getDay();
                var prevOffsetDate = -weekDatas.indexOf(selDay);
                var startDate = new Date(XEUtils.getWhatDay(selectMonth, prevOffsetDate).getTime() + dateHMSTime);
                for (var index = 0; index < 42; index++) {
                    var date = XEUtils.getWhatDay(startDate, index);
                    var itemFullYear = date.getFullYear();
                    var itemMonth = date.getMonth();
                    var itemDate = date.getDate();
                    var isPrev = date < selectMonth;
                    days.push({
                        date: date,
                        isPrev: isPrev,
                        isCurrent: itemFullYear === selFullYear && itemMonth === selMonth,
                        isNow: itemFullYear === currFullYear && itemMonth === currMonth && itemDate === currDate,
                        isNext: !isPrev && selMonth !== itemMonth,
                        label: itemDate
                    });
                }
            }
            return days;
        });
        var computeDayDatas = computed(function () {
            var dayList = computeDayList.value;
            return XEUtils.chunk(dayList, 7);
        });
        var computeWeekDates = computed(function () {
            var dayDatas = computeDayDatas.value;
            return dayDatas.map(function (list) {
                var firstItem = list[0];
                var item = {
                    date: firstItem.date,
                    isWeekNumber: true,
                    isPrev: false,
                    isCurrent: false,
                    isNow: false,
                    isNext: false,
                    label: XEUtils.getYearWeek(firstItem.date)
                };
                return [item].concat(list);
            });
        });
        var computeHourList = computed(function () {
            var list = [];
            var isDateTimeType = computeIsDateTimeType.value;
            if (isDateTimeType) {
                for (var index = 0; index < 24; index++) {
                    list.push({
                        value: index,
                        label: ('' + index).padStart(2, '0')
                    });
                }
            }
            return list;
        });
        var computeMinuteList = computed(function () {
            var list = [];
            var isDateTimeType = computeIsDateTimeType.value;
            if (isDateTimeType) {
                for (var index = 0; index < 60; index++) {
                    list.push({
                        value: index,
                        label: ('' + index).padStart(2, '0')
                    });
                }
            }
            return list;
        });
        var computeSecondList = computed(function () {
            var minuteList = computeMinuteList.value;
            return minuteList;
        });
        var computeInpReadonly = computed(function () {
            var type = props.type, readonly = props.readonly, editable = props.editable;
            return readonly || !editable || type === 'week' || type === 'quarter';
        });
        var computeInputType = computed(function () {
            var type = props.type;
            var showPwd = reactData.showPwd;
            var isNumType = computeIsNumType.value;
            var isDatePickerType = computeIsDatePickerType.value;
            var isPawdType = computeIsPawdType.value;
            if (isDatePickerType || isNumType || (isPawdType && showPwd) || type === 'number') {
                return 'text';
            }
            return type;
        });
        var computeInpPlaceholder = computed(function () {
            var placeholder = props.placeholder;
            if (placeholder) {
                return getFuncText(placeholder);
            }
            return '';
        });
        var computeInpMaxlength = computed(function () {
            var maxlength = props.maxlength;
            var isNumType = computeIsNumType.value;
            // 数值最大长度限制 16 位，包含小数
            return isNumType && !XEUtils.toNumber(maxlength) ? 16 : maxlength;
        });
        var computeInpImmediate = computed(function () {
            var type = props.type, immediate = props.immediate;
            return immediate || !(type === 'text' || type === 'number' || type === 'integer' || type === 'float');
        });
        function getNumberValue(val) {
            var type = props.type, exponential = props.exponential;
            var inpMaxlength = computeInpMaxlength.value;
            var digitsValue = computeDigitsValue.value;
            var restVal = (type === 'float' ? XEUtils.toFixed(XEUtils.floor(val, digitsValue), digitsValue) : XEUtils.toValueString(val));
            if (exponential && (val === restVal || XEUtils.toValueString(val).toLowerCase() === XEUtils.toNumber(restVal).toExponential())) {
                return val;
            }
            return restVal.slice(0, inpMaxlength);
        }
        var triggerEvent = function (evnt) {
            var inputValue = reactData.inputValue;
            inputMethods.dispatchEvent(evnt.type, { value: inputValue }, evnt);
        };
        var emitModel = function (value, evnt) {
            reactData.inputValue = value;
            emit('update:modelValue', value);
            inputMethods.dispatchEvent('input', { value: value }, evnt);
            if (XEUtils.toValueString(props.modelValue) !== value) {
                inputMethods.dispatchEvent('change', { value: value }, evnt);
            }
        };
        var emitInputEvent = function (value, evnt) {
            var isDatePickerType = computeIsDatePickerType.value;
            var inpImmediate = computeInpImmediate.value;
            reactData.inputValue = value;
            if (!isDatePickerType) {
                if (inpImmediate) {
                    emitModel(value, evnt);
                }
                else {
                    inputMethods.dispatchEvent('input', { value: value }, evnt);
                }
            }
        };
        var inputEvent = function (evnt) {
            var inputElem = evnt.target;
            var value = inputElem.value;
            emitInputEvent(value, evnt);
        };
        var changeEvent = function (evnt) {
            var inpImmediate = computeInpImmediate.value;
            if (!inpImmediate) {
                triggerEvent(evnt);
            }
        };
        var focusEvent = function (evnt) {
            reactData.isActivated = true;
            triggerEvent(evnt);
        };
        var clickPrefixEvent = function (evnt) {
            var disabled = props.disabled;
            if (!disabled) {
                var inputValue = reactData.inputValue;
                inputMethods.dispatchEvent('prefix-click', { value: inputValue }, evnt);
            }
        };
        var hidePanelTimeout;
        var hidePanel = function () {
            reactData.visiblePanel = false;
            hidePanelTimeout = window.setTimeout(function () {
                reactData.animatVisible = false;
            }, 350);
        };
        var clearValueEvent = function (evnt, value) {
            var type = props.type;
            var isNumType = computeIsNumType.value;
            var isDatePickerType = computeIsDatePickerType.value;
            if (isDatePickerType) {
                hidePanel();
            }
            if (isNumType || ['text', 'search', 'password'].indexOf(type) > -1) {
                focus();
            }
            inputMethods.dispatchEvent('clear', { value: value }, evnt);
        };
        var clickSuffixEvent = function (evnt) {
            var disabled = props.disabled;
            if (!disabled) {
                if (hasClass(evnt.currentTarget, 'is--clear')) {
                    emitModel('', evnt);
                    clearValueEvent(evnt, '');
                }
                else {
                    var inputValue = reactData.inputValue;
                    inputMethods.dispatchEvent('suffix-click', { value: inputValue }, evnt);
                }
            }
        };
        var dateParseValue = function (value) {
            var type = props.type;
            var valueFormat = props.valueFormat;
            var dateLabelFormat = computeDateLabelFormat.value;
            var dValue = null;
            var dLabel = '';
            if (value) {
                if (type === 'time') {
                    dValue = toStringTimeDate(value);
                }
                else {
                    dValue = XEUtils.toStringDate(value, valueFormat);
                }
            }
            if (XEUtils.isValidDate(dValue)) {
                dLabel = XEUtils.toDateString(dValue, dateLabelFormat);
            }
            else {
                dValue = null;
            }
            reactData.datePanelValue = dValue;
            reactData.datePanelLabel = dLabel;
        };
        /**
         * 值变化时处理
         */
        var changeValue = function () {
            var isDatePickerType = computeIsDatePickerType.value;
            var inputValue = reactData.inputValue;
            if (isDatePickerType) {
                dateParseValue(inputValue);
                reactData.inputValue = reactData.datePanelLabel;
            }
        };
        /**
         * 检查初始值
         */
        var initValue = function () {
            var type = props.type;
            var inputValue = reactData.inputValue;
            var isDatePickerType = computeIsDatePickerType.value;
            var digitsValue = computeDigitsValue.value;
            if (isDatePickerType) {
                changeValue();
            }
            else if (type === 'float') {
                if (inputValue) {
                    var validValue = XEUtils.toFixed(XEUtils.floor(inputValue, digitsValue), digitsValue);
                    if (inputValue !== validValue) {
                        emitModel(validValue, { type: 'init' });
                    }
                }
            }
        };
        var vaildMaxNum = function (num) {
            return props.max === null || XEUtils.toNumber(num) <= XEUtils.toNumber(props.max);
        };
        var vaildMinNum = function (num) {
            return props.min === null || XEUtils.toNumber(num) >= XEUtils.toNumber(props.min);
        };
        var dateRevert = function () {
            reactData.inputValue = reactData.datePanelLabel;
        };
        var dateCheckMonth = function (date) {
            var month = XEUtils.getWhatMonth(date, 0, 'first');
            if (!XEUtils.isEqual(month, reactData.selectMonth)) {
                reactData.selectMonth = month;
            }
        };
        var dateChange = function (date) {
            var modelValue = props.modelValue;
            var datetimePanelValue = reactData.datetimePanelValue;
            var isDateTimeType = computeIsDateTimeType.value;
            var dateValueFormat = computeDateValueFormat.value;
            if (props.type === 'week') {
                var sWeek = XEUtils.toNumber(props.selectDay);
                date = XEUtils.getWhatWeek(date, 0, sWeek);
            }
            else if (isDateTimeType) {
                date.setHours(datetimePanelValue.getHours());
                date.setMinutes(datetimePanelValue.getMinutes());
                date.setSeconds(datetimePanelValue.getSeconds());
            }
            var inpVal = XEUtils.toDateString(date, dateValueFormat);
            dateCheckMonth(date);
            if (!XEUtils.isEqual(modelValue, inpVal)) {
                emitModel(inpVal, { type: 'update' });
            }
        };
        var afterCheckValue = function () {
            var type = props.type, min = props.min, max = props.max, exponential = props.exponential;
            var inputValue = reactData.inputValue, datetimePanelValue = reactData.datetimePanelValue;
            var isNumType = computeIsNumType.value;
            var isDatePickerType = computeIsDatePickerType.value;
            var dateLabelFormat = computeDateLabelFormat.value;
            var inpReadonly = computeInpReadonly.value;
            if (!inpReadonly) {
                if (isNumType) {
                    if (inputValue) {
                        var inpNumVal = type === 'integer' ? XEUtils.toInteger(inputValue) : XEUtils.toNumber(inputValue);
                        if (!vaildMinNum(inpNumVal)) {
                            inpNumVal = min;
                        }
                        else if (!vaildMaxNum(inpNumVal)) {
                            inpNumVal = max;
                        }
                        if (exponential) {
                            var inpStringVal = XEUtils.toValueString(inputValue).toLowerCase();
                            if (inpStringVal === XEUtils.toNumber(inpNumVal).toExponential()) {
                                inpNumVal = inpStringVal;
                            }
                        }
                        emitModel(getNumberValue(inpNumVal), { type: 'check' });
                    }
                }
                else if (isDatePickerType) {
                    if (inputValue) {
                        var inpDateVal = void 0;
                        if (type === 'time') {
                            inpDateVal = toStringTimeDate(inputValue);
                        }
                        else {
                            inpDateVal = XEUtils.toStringDate(inputValue, dateLabelFormat);
                        }
                        if (XEUtils.isValidDate(inpDateVal)) {
                            if (type === 'time') {
                                inpDateVal = XEUtils.toDateString(inpDateVal, dateLabelFormat);
                                if (inputValue !== inpDateVal) {
                                    emitModel(inpDateVal, { type: 'check' });
                                }
                                reactData.inputValue = inpDateVal;
                            }
                            else {
                                var isChange = false;
                                if (type === 'datetime') {
                                    var dateValue = computeDateValue.value;
                                    if (inputValue !== XEUtils.toDateString(dateValue, dateLabelFormat) || inputValue !== XEUtils.toDateString(inpDateVal, dateLabelFormat)) {
                                        isChange = true;
                                        datetimePanelValue.setHours(inpDateVal.getHours());
                                        datetimePanelValue.setMinutes(inpDateVal.getMinutes());
                                        datetimePanelValue.setSeconds(inpDateVal.getSeconds());
                                    }
                                }
                                else {
                                    isChange = true;
                                }
                                reactData.inputValue = XEUtils.toDateString(inpDateVal, dateLabelFormat);
                                if (isChange) {
                                    dateChange(inpDateVal);
                                }
                            }
                        }
                        else {
                            dateRevert();
                        }
                    }
                    else {
                        emitModel('', { type: 'check' });
                    }
                }
            }
        };
        var blurEvent = function (evnt) {
            var inputValue = reactData.inputValue;
            var inpImmediate = computeInpImmediate.value;
            if (!inpImmediate) {
                emitModel(inputValue, evnt);
            }
            afterCheckValue();
            if (!reactData.visiblePanel) {
                reactData.isActivated = false;
            }
            inputMethods.dispatchEvent('blur', { value: inputValue }, evnt);
        };
        // 密码
        var passwordToggleEvent = function (evnt) {
            var readonly = props.readonly, disabled = props.disabled;
            var showPwd = reactData.showPwd;
            if (!disabled && !readonly) {
                reactData.showPwd = !showPwd;
            }
            inputMethods.dispatchEvent('toggle-visible', { visible: reactData.showPwd }, evnt);
        };
        // 密码
        // 搜索
        var searchEvent = function (evnt) {
            inputMethods.dispatchEvent('search-click', {}, evnt);
        };
        // 搜索
        // 数值
        var numberChange = function (isPlus, evnt) {
            var min = props.min, max = props.max, type = props.type;
            var inputValue = reactData.inputValue;
            var stepValue = computeStepValue.value;
            var numValue = type === 'integer' ? XEUtils.toInteger(inputValue) : XEUtils.toNumber(inputValue);
            var newValue = isPlus ? XEUtils.add(numValue, stepValue) : XEUtils.subtract(numValue, stepValue);
            var restNum;
            if (!vaildMinNum(newValue)) {
                restNum = min;
            }
            else if (!vaildMaxNum(newValue)) {
                restNum = max;
            }
            else {
                restNum = newValue;
            }
            emitInputEvent(getNumberValue(restNum), evnt);
        };
        var downbumTimeout;
        var numberNextEvent = function (evnt) {
            var readonly = props.readonly, disabled = props.disabled;
            clearTimeout(downbumTimeout);
            if (!disabled && !readonly) {
                numberChange(false, evnt);
            }
            inputMethods.dispatchEvent('next-number', {}, evnt);
        };
        var numberDownNextEvent = function (evnt) {
            downbumTimeout = window.setTimeout(function () {
                numberNextEvent(evnt);
                numberDownNextEvent(evnt);
            }, 60);
        };
        var numberPrevEvent = function (evnt) {
            var readonly = props.readonly, disabled = props.disabled;
            clearTimeout(downbumTimeout);
            if (!disabled && !readonly) {
                numberChange(true, evnt);
            }
            inputMethods.dispatchEvent('prev-number', {}, evnt);
        };
        var numberKeydownEvent = function (evnt) {
            var isUpArrow = hasEventKey(evnt, EVENT_KEYS.ARROW_UP);
            var isDwArrow = hasEventKey(evnt, EVENT_KEYS.ARROW_DOWN);
            if (isUpArrow || isDwArrow) {
                evnt.preventDefault();
                if (isUpArrow) {
                    numberPrevEvent(evnt);
                }
                else {
                    numberNextEvent(evnt);
                }
            }
        };
        var keydownEvent = function (evnt) {
            var exponential = props.exponential, controls = props.controls;
            var isNumType = computeIsNumType.value;
            if (isNumType) {
                var isCtrlKey = evnt.ctrlKey;
                var isShiftKey = evnt.shiftKey;
                var isAltKey = evnt.altKey;
                var keyCode = evnt.keyCode;
                if (!isCtrlKey && !isShiftKey && !isAltKey && (hasEventKey(evnt, EVENT_KEYS.SPACEBAR) || ((!exponential || keyCode !== 69) && (keyCode >= 65 && keyCode <= 90)) || (keyCode >= 186 && keyCode <= 188) || keyCode >= 191)) {
                    evnt.preventDefault();
                }
                if (controls) {
                    numberKeydownEvent(evnt);
                }
            }
            triggerEvent(evnt);
        };
        var keyupEvent = function (evnt) {
            triggerEvent(evnt);
        };
        // 数值
        var numberStopDown = function () {
            clearTimeout(downbumTimeout);
        };
        var numberDownPrevEvent = function (evnt) {
            downbumTimeout = window.setTimeout(function () {
                numberPrevEvent(evnt);
                numberDownPrevEvent(evnt);
            }, 60);
        };
        var numberMousedownEvent = function (evnt) {
            numberStopDown();
            if (evnt.button === 0) {
                var isPrevNumber_1 = hasClass(evnt.currentTarget, 'is--prev');
                if (isPrevNumber_1) {
                    numberPrevEvent(evnt);
                }
                else {
                    numberNextEvent(evnt);
                }
                downbumTimeout = window.setTimeout(function () {
                    if (isPrevNumber_1) {
                        numberDownPrevEvent(evnt);
                    }
                    else {
                        numberDownNextEvent(evnt);
                    }
                }, 500);
            }
        };
        var wheelEvent = function (evnt) {
            var isNumType = computeIsNumType.value;
            if (isNumType && props.controls) {
                if (reactData.isActivated) {
                    var delta = evnt.deltaY;
                    if (delta > 0) {
                        numberNextEvent(evnt);
                    }
                    else if (delta < 0) {
                        numberPrevEvent(evnt);
                    }
                    evnt.preventDefault();
                }
            }
            triggerEvent(evnt);
        };
        // 日期
        var dateMonthHandle = function (date, offsetMonth) {
            reactData.selectMonth = XEUtils.getWhatMonth(date, offsetMonth, 'first');
        };
        var dateNowHandle = function () {
            var currentDate = XEUtils.getWhatDay(Date.now(), 0, 'first');
            reactData.currentDate = currentDate;
            dateMonthHandle(currentDate, 0);
        };
        var dateToggleTypeEvent = function () {
            var datePanelType = reactData.datePanelType;
            if (datePanelType === 'month' || datePanelType === 'quarter') {
                datePanelType = 'year';
            }
            else {
                datePanelType = 'month';
            }
            reactData.datePanelType = datePanelType;
        };
        var datePrevEvent = function (evnt) {
            var type = props.type;
            var datePanelType = reactData.datePanelType, selectMonth = reactData.selectMonth;
            var isDisabledPrevDateBtn = computeIsDisabledPrevDateBtn.value;
            if (!isDisabledPrevDateBtn) {
                if (type === 'year') {
                    reactData.selectMonth = XEUtils.getWhatYear(selectMonth, -yearSize, 'first');
                }
                else if (type === 'month' || type === 'quarter') {
                    if (datePanelType === 'year') {
                        reactData.selectMonth = XEUtils.getWhatYear(selectMonth, -yearSize, 'first');
                    }
                    else {
                        reactData.selectMonth = XEUtils.getWhatYear(selectMonth, -1, 'first');
                    }
                }
                else {
                    if (datePanelType === 'year') {
                        reactData.selectMonth = XEUtils.getWhatYear(selectMonth, -yearSize, 'first');
                    }
                    else if (datePanelType === 'month') {
                        reactData.selectMonth = XEUtils.getWhatYear(selectMonth, -1, 'first');
                    }
                    else {
                        reactData.selectMonth = XEUtils.getWhatMonth(selectMonth, -1, 'first');
                    }
                }
                inputMethods.dispatchEvent('date-prev', { type: type }, evnt);
            }
        };
        var dateTodayMonthEvent = function (evnt) {
            dateNowHandle();
            dateChange(reactData.currentDate);
            hidePanel();
            inputMethods.dispatchEvent('date-today', { type: props.type }, evnt);
        };
        var dateNextEvent = function (evnt) {
            var type = props.type;
            var datePanelType = reactData.datePanelType, selectMonth = reactData.selectMonth;
            var isDisabledNextDateBtn = computeIsDisabledNextDateBtn.value;
            if (!isDisabledNextDateBtn) {
                if (type === 'year') {
                    reactData.selectMonth = XEUtils.getWhatYear(selectMonth, yearSize, 'first');
                }
                else if (type === 'month' || type === 'quarter') {
                    if (datePanelType === 'year') {
                        reactData.selectMonth = XEUtils.getWhatYear(selectMonth, yearSize, 'first');
                    }
                    else {
                        reactData.selectMonth = XEUtils.getWhatYear(selectMonth, 1, 'first');
                    }
                }
                else {
                    if (datePanelType === 'year') {
                        reactData.selectMonth = XEUtils.getWhatYear(selectMonth, yearSize, 'first');
                    }
                    else if (datePanelType === 'month') {
                        reactData.selectMonth = XEUtils.getWhatYear(selectMonth, 1, 'first');
                    }
                    else {
                        reactData.selectMonth = XEUtils.getWhatMonth(selectMonth, 1, 'first');
                    }
                }
                inputMethods.dispatchEvent('date-next', { type: type }, evnt);
            }
        };
        var isDateDisabled = function (item) {
            var disabledMethod = props.disabledMethod;
            var datePanelType = reactData.datePanelType;
            return disabledMethod && disabledMethod({ type: datePanelType, viewType: datePanelType, date: item.date, $input: $xeinput });
        };
        var dateSelectItem = function (date) {
            var type = props.type;
            var datePanelType = reactData.datePanelType;
            if (type === 'month') {
                if (datePanelType === 'year') {
                    reactData.datePanelType = 'month';
                    dateCheckMonth(date);
                }
                else {
                    dateChange(date);
                    hidePanel();
                }
            }
            else if (type === 'year') {
                dateChange(date);
                hidePanel();
            }
            else if (type === 'quarter') {
                if (datePanelType === 'year') {
                    reactData.datePanelType = 'quarter';
                    dateCheckMonth(date);
                }
                else {
                    dateChange(date);
                    hidePanel();
                }
            }
            else {
                if (datePanelType === 'month') {
                    reactData.datePanelType = type === 'week' ? type : 'day';
                    dateCheckMonth(date);
                }
                else if (datePanelType === 'year') {
                    reactData.datePanelType = 'month';
                    dateCheckMonth(date);
                }
                else {
                    dateChange(date);
                    hidePanel();
                }
            }
        };
        var dateSelectEvent = function (item) {
            if (!isDateDisabled(item)) {
                dateSelectItem(item.date);
            }
        };
        var dateMoveDay = function (offsetDay) {
            if (!isDateDisabled({ date: offsetDay })) {
                var dayList = computeDayList.value;
                if (!dayList.some(function (item) { return XEUtils.isDateSame(item.date, offsetDay, 'yyyyMMdd'); })) {
                    dateCheckMonth(offsetDay);
                }
                dateParseValue(offsetDay);
            }
        };
        var dateMoveYear = function (offsetYear) {
            if (!isDateDisabled({ date: offsetYear })) {
                var yearList = computeYearList.value;
                if (!yearList.some(function (item) { return XEUtils.isDateSame(item.date, offsetYear, 'yyyy'); })) {
                    dateCheckMonth(offsetYear);
                }
                dateParseValue(offsetYear);
            }
        };
        var dateMoveQuarter = function (offsetQuarter) {
            if (!isDateDisabled({ date: offsetQuarter })) {
                var quarterList = computeQuarterList.value;
                if (!quarterList.some(function (item) { return XEUtils.isDateSame(item.date, offsetQuarter, 'yyyyq'); })) {
                    dateCheckMonth(offsetQuarter);
                }
                dateParseValue(offsetQuarter);
            }
        };
        var dateMoveMonth = function (offsetMonth) {
            if (!isDateDisabled({ date: offsetMonth })) {
                var monthList = computeMonthList.value;
                if (!monthList.some(function (item) { return XEUtils.isDateSame(item.date, offsetMonth, 'yyyyMM'); })) {
                    dateCheckMonth(offsetMonth);
                }
                dateParseValue(offsetMonth);
            }
        };
        var dateMouseenterEvent = function (item) {
            if (!isDateDisabled(item)) {
                var datePanelType = reactData.datePanelType;
                if (datePanelType === 'month') {
                    dateMoveMonth(item.date);
                }
                else if (datePanelType === 'quarter') {
                    dateMoveQuarter(item.date);
                }
                else if (datePanelType === 'year') {
                    dateMoveYear(item.date);
                }
                else {
                    dateMoveDay(item.date);
                }
            }
        };
        var updateTimePos = function (liElem) {
            if (liElem) {
                var height = liElem.offsetHeight;
                var ulElem = liElem.parentNode;
                ulElem.scrollTop = liElem.offsetTop - height * 4;
            }
        };
        var dateTimeChangeEvent = function (evnt) {
            reactData.datetimePanelValue = new Date(reactData.datetimePanelValue.getTime());
            updateTimePos(evnt.currentTarget);
        };
        var dateHourEvent = function (evnt, item) {
            reactData.datetimePanelValue.setHours(item.value);
            dateTimeChangeEvent(evnt);
        };
        var dateConfirmEvent = function () {
            var dateValue = computeDateValue.value;
            dateChange(dateValue || reactData.currentDate);
            hidePanel();
        };
        var dateMinuteEvent = function (evnt, item) {
            reactData.datetimePanelValue.setMinutes(item.value);
            dateTimeChangeEvent(evnt);
        };
        var dateSecondEvent = function (evnt, item) {
            reactData.datetimePanelValue.setSeconds(item.value);
            dateTimeChangeEvent(evnt);
        };
        var dateOffsetEvent = function (evnt) {
            var isActivated = reactData.isActivated, datePanelValue = reactData.datePanelValue, datePanelType = reactData.datePanelType;
            if (isActivated) {
                evnt.preventDefault();
                var isLeftArrow = hasEventKey(evnt, EVENT_KEYS.ARROW_LEFT);
                var isUpArrow = hasEventKey(evnt, EVENT_KEYS.ARROW_UP);
                var isRightArrow = hasEventKey(evnt, EVENT_KEYS.ARROW_RIGHT);
                var isDwArrow = hasEventKey(evnt, EVENT_KEYS.ARROW_DOWN);
                if (datePanelType === 'year') {
                    var offsetYear = XEUtils.getWhatYear(datePanelValue || Date.now(), 0, 'first');
                    if (isLeftArrow) {
                        offsetYear = XEUtils.getWhatYear(offsetYear, -1);
                    }
                    else if (isUpArrow) {
                        offsetYear = XEUtils.getWhatYear(offsetYear, -4);
                    }
                    else if (isRightArrow) {
                        offsetYear = XEUtils.getWhatYear(offsetYear, 1);
                    }
                    else if (isDwArrow) {
                        offsetYear = XEUtils.getWhatYear(offsetYear, 4);
                    }
                    dateMoveYear(offsetYear);
                }
                else if (datePanelType === 'quarter') {
                    var offsetQuarter = XEUtils.getWhatQuarter(datePanelValue || Date.now(), 0, 'first');
                    if (isLeftArrow) {
                        offsetQuarter = XEUtils.getWhatQuarter(offsetQuarter, -1);
                    }
                    else if (isUpArrow) {
                        offsetQuarter = XEUtils.getWhatQuarter(offsetQuarter, -2);
                    }
                    else if (isRightArrow) {
                        offsetQuarter = XEUtils.getWhatQuarter(offsetQuarter, 1);
                    }
                    else if (isDwArrow) {
                        offsetQuarter = XEUtils.getWhatQuarter(offsetQuarter, 2);
                    }
                    dateMoveQuarter(offsetQuarter);
                }
                else if (datePanelType === 'month') {
                    var offsetMonth = XEUtils.getWhatMonth(datePanelValue || Date.now(), 0, 'first');
                    if (isLeftArrow) {
                        offsetMonth = XEUtils.getWhatMonth(offsetMonth, -1);
                    }
                    else if (isUpArrow) {
                        offsetMonth = XEUtils.getWhatMonth(offsetMonth, -4);
                    }
                    else if (isRightArrow) {
                        offsetMonth = XEUtils.getWhatMonth(offsetMonth, 1);
                    }
                    else if (isDwArrow) {
                        offsetMonth = XEUtils.getWhatMonth(offsetMonth, 4);
                    }
                    dateMoveMonth(offsetMonth);
                }
                else {
                    var offsetDay = datePanelValue || XEUtils.getWhatDay(Date.now(), 0, 'first');
                    if (isLeftArrow) {
                        offsetDay = XEUtils.getWhatDay(offsetDay, -1);
                    }
                    else if (isUpArrow) {
                        offsetDay = XEUtils.getWhatWeek(offsetDay, -1);
                    }
                    else if (isRightArrow) {
                        offsetDay = XEUtils.getWhatDay(offsetDay, 1);
                    }
                    else if (isDwArrow) {
                        offsetDay = XEUtils.getWhatWeek(offsetDay, 1);
                    }
                    dateMoveDay(offsetDay);
                }
            }
        };
        var datePgOffsetEvent = function (evnt) {
            var isActivated = reactData.isActivated;
            if (isActivated) {
                var isPgUp = hasEventKey(evnt, EVENT_KEYS.PAGE_UP);
                evnt.preventDefault();
                if (isPgUp) {
                    datePrevEvent(evnt);
                }
                else {
                    dateNextEvent(evnt);
                }
            }
        };
        var dateOpenPanel = function () {
            var type = props.type;
            var isDateTimeType = computeIsDateTimeType.value;
            var dateValue = computeDateValue.value;
            if (['year', 'quarter', 'month', 'week'].indexOf(type) > -1) {
                reactData.datePanelType = type;
            }
            else {
                reactData.datePanelType = 'day';
            }
            reactData.currentDate = XEUtils.getWhatDay(Date.now(), 0, 'first');
            if (dateValue) {
                dateMonthHandle(dateValue, 0);
                dateParseValue(dateValue);
            }
            else {
                dateNowHandle();
            }
            if (isDateTimeType) {
                reactData.datetimePanelValue = reactData.datePanelValue || XEUtils.getWhatDay(Date.now(), 0, 'first');
                nextTick(function () {
                    var timeBodyElem = refInputTimeBody.value;
                    XEUtils.arrayEach(timeBodyElem.querySelectorAll('li.is--selected'), updateTimePos);
                });
            }
        };
        // 日期
        // 弹出面板
        var updateZindex = function () {
            if (reactData.panelIndex < getLastZIndex()) {
                reactData.panelIndex = nextZIndex();
            }
        };
        var updatePlacement = function () {
            return nextTick().then(function () {
                var transfer = props.transfer, placement = props.placement;
                var panelIndex = reactData.panelIndex;
                var targetElem = refInputTarget.value;
                var panelElem = refInputPanel.value;
                if (targetElem && panelElem) {
                    var targetHeight = targetElem.offsetHeight;
                    var targetWidth = targetElem.offsetWidth;
                    var panelHeight = panelElem.offsetHeight;
                    var panelWidth = panelElem.offsetWidth;
                    var marginSize = 5;
                    var panelStyle = {
                        zIndex: panelIndex
                    };
                    var _a = getAbsolutePos(targetElem), boundingTop = _a.boundingTop, boundingLeft = _a.boundingLeft, visibleHeight = _a.visibleHeight, visibleWidth = _a.visibleWidth;
                    var panelPlacement = 'bottom';
                    if (transfer) {
                        var left = boundingLeft;
                        var top_1 = boundingTop + targetHeight;
                        if (placement === 'top') {
                            panelPlacement = 'top';
                            top_1 = boundingTop - panelHeight;
                        }
                        else if (!placement) {
                            // 如果下面不够放，则向上
                            if (top_1 + panelHeight + marginSize > visibleHeight) {
                                panelPlacement = 'top';
                                top_1 = boundingTop - panelHeight;
                            }
                            // 如果上面不够放，则向下（优先）
                            if (top_1 < marginSize) {
                                panelPlacement = 'bottom';
                                top_1 = boundingTop + targetHeight;
                            }
                        }
                        // 如果溢出右边
                        if (left + panelWidth + marginSize > visibleWidth) {
                            left -= left + panelWidth + marginSize - visibleWidth;
                        }
                        // 如果溢出左边
                        if (left < marginSize) {
                            left = marginSize;
                        }
                        Object.assign(panelStyle, {
                            left: left + "px",
                            top: top_1 + "px",
                            minWidth: targetWidth + "px"
                        });
                    }
                    else {
                        if (placement === 'top') {
                            panelPlacement = 'top';
                            panelStyle.bottom = targetHeight + "px";
                        }
                        else if (!placement) {
                            // 如果下面不够放，则向上
                            if (boundingTop + targetHeight + panelHeight > visibleHeight) {
                                // 如果上面不够放，则向下（优先）
                                if (boundingTop - targetHeight - panelHeight > marginSize) {
                                    panelPlacement = 'top';
                                    panelStyle.bottom = targetHeight + "px";
                                }
                            }
                        }
                    }
                    reactData.panelStyle = panelStyle;
                    reactData.panelPlacement = panelPlacement;
                    return nextTick();
                }
            });
        };
        var showPanel = function () {
            var disabled = props.disabled;
            var visiblePanel = reactData.visiblePanel;
            var isDatePickerType = computeIsDatePickerType.value;
            if (!disabled && !visiblePanel) {
                if (!reactData.inited) {
                    reactData.inited = true;
                }
                clearTimeout(hidePanelTimeout);
                reactData.isActivated = true;
                reactData.animatVisible = true;
                if (isDatePickerType) {
                    dateOpenPanel();
                }
                setTimeout(function () {
                    reactData.visiblePanel = true;
                }, 10);
                updateZindex();
                updatePlacement();
            }
        };
        var datePickerOpenEvent = function (evnt) {
            var readonly = props.readonly;
            if (!readonly) {
                evnt.preventDefault();
                showPanel();
            }
        };
        var clickEvent = function (evnt) {
            var isDatePickerType = computeIsDatePickerType.value;
            if (isDatePickerType) {
                datePickerOpenEvent(evnt);
            }
            triggerEvent(evnt);
        };
        // 弹出面板
        // 全局事件
        var handleGlobalMousedownEvent = function (evnt) {
            var disabled = props.disabled;
            var visiblePanel = reactData.visiblePanel, isActivated = reactData.isActivated;
            var isDatePickerType = computeIsDatePickerType.value;
            var el = refElem.value;
            var panelElem = refInputPanel.value;
            if (!disabled && isActivated) {
                reactData.isActivated = getEventTargetNode(evnt, el).flag || getEventTargetNode(evnt, panelElem).flag;
                if (!reactData.isActivated) {
                    // 如果是日期类型
                    if (isDatePickerType) {
                        if (visiblePanel) {
                            hidePanel();
                            afterCheckValue();
                        }
                    }
                    else {
                        afterCheckValue();
                    }
                }
            }
        };
        var handleGlobalKeydownEvent = function (evnt) {
            var clearable = props.clearable, disabled = props.disabled;
            var visiblePanel = reactData.visiblePanel;
            var isDatePickerType = computeIsDatePickerType.value;
            if (!disabled) {
                var isTab = hasEventKey(evnt, EVENT_KEYS.TAB);
                var isDel = hasEventKey(evnt, EVENT_KEYS.DELETE);
                var isEsc = hasEventKey(evnt, EVENT_KEYS.ESCAPE);
                var isEnter = hasEventKey(evnt, EVENT_KEYS.ENTER);
                var isLeftArrow = hasEventKey(evnt, EVENT_KEYS.ARROW_LEFT);
                var isUpArrow = hasEventKey(evnt, EVENT_KEYS.ARROW_UP);
                var isRightArrow = hasEventKey(evnt, EVENT_KEYS.ARROW_RIGHT);
                var isDwArrow = hasEventKey(evnt, EVENT_KEYS.ARROW_DOWN);
                var isPgUp = hasEventKey(evnt, EVENT_KEYS.PAGE_UP);
                var isPgDn = hasEventKey(evnt, EVENT_KEYS.PAGE_DOWN);
                var operArrow = isLeftArrow || isUpArrow || isRightArrow || isDwArrow;
                var isActivated = reactData.isActivated;
                if (isTab) {
                    if (isActivated) {
                        afterCheckValue();
                    }
                    isActivated = false;
                    reactData.isActivated = isActivated;
                }
                else if (operArrow) {
                    if (isDatePickerType) {
                        if (isActivated) {
                            if (visiblePanel) {
                                dateOffsetEvent(evnt);
                            }
                            else if (isUpArrow || isDwArrow) {
                                datePickerOpenEvent(evnt);
                            }
                        }
                    }
                }
                else if (isEnter) {
                    if (isDatePickerType) {
                        if (visiblePanel) {
                            if (reactData.datePanelValue) {
                                dateSelectItem(reactData.datePanelValue);
                            }
                            else {
                                hidePanel();
                            }
                        }
                        else if (isActivated) {
                            datePickerOpenEvent(evnt);
                        }
                    }
                }
                else if (isPgUp || isPgDn) {
                    if (isDatePickerType) {
                        if (isActivated) {
                            datePgOffsetEvent(evnt);
                        }
                    }
                }
                if (isTab || isEsc) {
                    if (visiblePanel) {
                        hidePanel();
                    }
                }
                else if (isDel && clearable) {
                    if (isActivated) {
                        clearValueEvent(evnt, null);
                    }
                }
            }
        };
        var handleGlobalMousewheelEvent = function (evnt) {
            var disabled = props.disabled;
            var visiblePanel = reactData.visiblePanel;
            if (!disabled) {
                if (visiblePanel) {
                    var panelElem = refInputPanel.value;
                    if (getEventTargetNode(evnt, panelElem).flag) {
                        updatePlacement();
                    }
                    else {
                        hidePanel();
                        afterCheckValue();
                    }
                }
            }
        };
        var handleGlobalBlurEvent = function () {
            var isActivated = reactData.isActivated, visiblePanel = reactData.visiblePanel;
            if (visiblePanel) {
                hidePanel();
                afterCheckValue();
            }
            else if (isActivated) {
                afterCheckValue();
            }
        };
        var renderDateLabel = function (item, label) {
            var festivalMethod = props.festivalMethod;
            if (festivalMethod) {
                var datePanelType = reactData.datePanelType;
                var festivalRest = festivalMethod({ type: datePanelType, viewType: datePanelType, date: item.date, $input: $xeinput });
                var festivalItem = festivalRest ? (XEUtils.isString(festivalRest) ? { label: festivalRest } : festivalRest) : {};
                var extraItem = festivalItem.extra ? (XEUtils.isString(festivalItem.extra) ? { label: festivalItem.extra } : festivalItem.extra) : null;
                var labels = [
                    h('span', {
                        class: ['vxe-input--date-label', {
                                'is-notice': festivalItem.notice
                            }]
                    }, extraItem && extraItem.label ? [
                        h('span', label),
                        h('span', {
                            class: ['vxe-input--date-label--extra', extraItem.important ? 'is-important' : '', extraItem.className],
                            style: extraItem.style
                        }, XEUtils.toValueString(extraItem.label))
                    ] : label)
                ];
                var festivalLabel = festivalItem.label;
                if (festivalLabel) {
                    // 默认最多支持3个节日重叠
                    var festivalLabels = XEUtils.toValueString(festivalLabel).split(',');
                    labels.push(h('span', {
                        class: ['vxe-input--date-festival', festivalItem.important ? 'is-important' : '', festivalItem.className],
                        style: festivalItem.style
                    }, [
                        festivalLabels.length > 1 ? h('span', {
                            class: ['vxe-input--date-festival--overlap', "overlap--" + festivalLabels.length]
                        }, festivalLabels.map(function (label) { return h('span', label.substring(0, 3)); })) : h('span', {
                            class: 'vxe-input--date-festival--label'
                        }, festivalLabels[0].substring(0, 3))
                    ]));
                }
                return labels;
            }
            return label;
        };
        var renderDateDayTable = function () {
            var datePanelType = reactData.datePanelType, datePanelValue = reactData.datePanelValue;
            var dateValue = computeDateValue.value;
            var dateHeaders = computeDateHeaders.value;
            var dayDatas = computeDayDatas.value;
            var matchFormat = 'yyyyMMdd';
            return [
                h('table', {
                    class: "vxe-input--date-" + datePanelType + "-view",
                    cellspacing: 0,
                    cellpadding: 0,
                    border: 0
                }, [
                    h('thead', [
                        h('tr', dateHeaders.map(function (item) {
                            return h('th', item.label);
                        }))
                    ]),
                    h('tbody', dayDatas.map(function (rows) {
                        return h('tr', rows.map(function (item) {
                            return h('td', {
                                class: {
                                    'is--prev': item.isPrev,
                                    'is--current': item.isCurrent,
                                    'is--now': item.isNow,
                                    'is--next': item.isNext,
                                    'is--disabled': isDateDisabled(item),
                                    'is--selected': XEUtils.isDateSame(dateValue, item.date, matchFormat),
                                    'is--hover': XEUtils.isDateSame(datePanelValue, item.date, matchFormat)
                                },
                                onClick: function () { return dateSelectEvent(item); },
                                onMouseenter: function () { return dateMouseenterEvent(item); }
                            }, renderDateLabel(item, item.label));
                        }));
                    }))
                ])
            ];
        };
        var renderDateWeekTable = function () {
            var datePanelType = reactData.datePanelType, datePanelValue = reactData.datePanelValue;
            var dateValue = computeDateValue.value;
            var weekHeaders = computeWeekHeaders.value;
            var weekDates = computeWeekDates.value;
            var matchFormat = 'yyyyMMdd';
            return [
                h('table', {
                    class: "vxe-input--date-" + datePanelType + "-view",
                    cellspacing: 0,
                    cellpadding: 0,
                    border: 0
                }, [
                    h('thead', [
                        h('tr', weekHeaders.map(function (item) {
                            return h('th', item.label);
                        }))
                    ]),
                    h('tbody', weekDates.map(function (rows) {
                        var isSelected = rows.some(function (item) { return XEUtils.isDateSame(dateValue, item.date, matchFormat); });
                        var isHover = rows.some(function (item) { return XEUtils.isDateSame(datePanelValue, item.date, matchFormat); });
                        return h('tr', rows.map(function (item) {
                            return h('td', {
                                class: {
                                    'is--prev': item.isPrev,
                                    'is--current': item.isCurrent,
                                    'is--now': item.isNow,
                                    'is--next': item.isNext,
                                    'is--disabled': isDateDisabled(item),
                                    'is--selected': isSelected,
                                    'is--hover': isHover
                                },
                                // event
                                onClick: function () { return dateSelectEvent(item); },
                                onMouseenter: function () { return dateMouseenterEvent(item); }
                            }, renderDateLabel(item, item.label));
                        }));
                    }))
                ])
            ];
        };
        var renderDateMonthTable = function () {
            var datePanelType = reactData.datePanelType, datePanelValue = reactData.datePanelValue;
            var dateValue = computeDateValue.value;
            var monthDatas = computeMonthDatas.value;
            var matchFormat = 'yyyyMM';
            return [
                h('table', {
                    class: "vxe-input--date-" + datePanelType + "-view",
                    cellspacing: 0,
                    cellpadding: 0,
                    border: 0
                }, [
                    h('tbody', monthDatas.map(function (rows) {
                        return h('tr', rows.map(function (item) {
                            return h('td', {
                                class: {
                                    'is--prev': item.isPrev,
                                    'is--current': item.isCurrent,
                                    'is--now': item.isNow,
                                    'is--next': item.isNext,
                                    'is--disabled': isDateDisabled(item),
                                    'is--selected': XEUtils.isDateSame(dateValue, item.date, matchFormat),
                                    'is--hover': XEUtils.isDateSame(datePanelValue, item.date, matchFormat)
                                },
                                onClick: function () { return dateSelectEvent(item); },
                                onMouseenter: function () { return dateMouseenterEvent(item); }
                            }, renderDateLabel(item, GlobalConfig.i18n("vxe.input.date.months.m" + item.month)));
                        }));
                    }))
                ])
            ];
        };
        var renderDateQuarterTable = function () {
            var datePanelType = reactData.datePanelType, datePanelValue = reactData.datePanelValue;
            var dateValue = computeDateValue.value;
            var quarterDatas = computeQuarterDatas.value;
            var matchFormat = 'yyyyq';
            return [
                h('table', {
                    class: "vxe-input--date-" + datePanelType + "-view",
                    cellspacing: 0,
                    cellpadding: 0,
                    border: 0
                }, [
                    h('tbody', quarterDatas.map(function (rows) {
                        return h('tr', rows.map(function (item) {
                            return h('td', {
                                class: {
                                    'is--prev': item.isPrev,
                                    'is--current': item.isCurrent,
                                    'is--now': item.isNow,
                                    'is--next': item.isNext,
                                    'is--disabled': isDateDisabled(item),
                                    'is--selected': XEUtils.isDateSame(dateValue, item.date, matchFormat),
                                    'is--hover': XEUtils.isDateSame(datePanelValue, item.date, matchFormat)
                                },
                                onClick: function () { return dateSelectEvent(item); },
                                onMouseenter: function () { return dateMouseenterEvent(item); }
                            }, renderDateLabel(item, GlobalConfig.i18n("vxe.input.date.quarters.q" + item.quarter)));
                        }));
                    }))
                ])
            ];
        };
        var renderDateYearTable = function () {
            var datePanelType = reactData.datePanelType, datePanelValue = reactData.datePanelValue;
            var dateValue = computeDateValue.value;
            var yearDatas = computeYearDatas.value;
            var matchFormat = 'yyyy';
            return [
                h('table', {
                    class: "vxe-input--date-" + datePanelType + "-view",
                    cellspacing: 0,
                    cellpadding: 0,
                    border: 0
                }, [
                    h('tbody', yearDatas.map(function (rows) {
                        return h('tr', rows.map(function (item) {
                            return h('td', {
                                class: {
                                    'is--disabled': isDateDisabled(item),
                                    'is--current': item.isCurrent,
                                    'is--now': item.isNow,
                                    'is--selected': XEUtils.isDateSame(dateValue, item.date, matchFormat),
                                    'is--hover': XEUtils.isDateSame(datePanelValue, item.date, matchFormat)
                                },
                                onClick: function () { return dateSelectEvent(item); },
                                onMouseenter: function () { return dateMouseenterEvent(item); }
                            }, renderDateLabel(item, item.year));
                        }));
                    }))
                ])
            ];
        };
        var renderDateTable = function () {
            var datePanelType = reactData.datePanelType;
            switch (datePanelType) {
                case 'week':
                    return renderDateWeekTable();
                case 'month':
                    return renderDateMonthTable();
                case 'quarter':
                    return renderDateQuarterTable();
                case 'year':
                    return renderDateYearTable();
            }
            return renderDateDayTable();
        };
        var renderDatePanel = function () {
            var datePanelType = reactData.datePanelType;
            var isDisabledPrevDateBtn = computeIsDisabledPrevDateBtn.value;
            var isDisabledNextDateBtn = computeIsDisabledNextDateBtn.value;
            var selectDatePanelLabel = computeSelectDatePanelLabel.value;
            return [
                h('div', {
                    class: 'vxe-input--date-picker-header'
                }, [
                    h('div', {
                        class: 'vxe-input--date-picker-type-wrapper'
                    }, [
                        datePanelType === 'year' ? h('span', {
                            class: 'vxe-input--date-picker-label'
                        }, selectDatePanelLabel) : h('span', {
                            class: 'vxe-input--date-picker-btn',
                            onClick: dateToggleTypeEvent
                        }, selectDatePanelLabel)
                    ]),
                    h('div', {
                        class: 'vxe-input--date-picker-btn-wrapper'
                    }, [
                        h('span', {
                            class: ['vxe-input--date-picker-btn vxe-input--date-picker-prev-btn', {
                                    'is--disabled': isDisabledPrevDateBtn
                                }],
                            onClick: datePrevEvent
                        }, [
                            h('i', {
                                class: 'vxe-icon--caret-left'
                            })
                        ]),
                        h('span', {
                            class: 'vxe-input--date-picker-btn vxe-input--date-picker-current-btn',
                            onClick: dateTodayMonthEvent
                        }, [
                            h('i', {
                                class: 'vxe-icon--dot'
                            })
                        ]),
                        h('span', {
                            class: ['vxe-input--date-picker-btn vxe-input--date-picker-next-btn', {
                                    'is--disabled': isDisabledNextDateBtn
                                }],
                            onClick: dateNextEvent
                        }, [
                            h('i', {
                                class: 'vxe-icon--caret-right'
                            })
                        ])
                    ])
                ]),
                h('div', {
                    class: 'vxe-input--date-picker-body'
                }, renderDateTable())
            ];
        };
        var renderTimePanel = function () {
            var datetimePanelValue = reactData.datetimePanelValue;
            var dateTimeLabel = computeDateTimeLabel.value;
            var hourList = computeHourList.value;
            var minuteList = computeMinuteList.value;
            var secondList = computeSecondList.value;
            return [
                h('div', {
                    class: 'vxe-input--time-picker-header'
                }, [
                    h('span', {
                        class: 'vxe-input--time-picker-title'
                    }, dateTimeLabel),
                    h('button', {
                        class: 'vxe-input--time-picker-confirm',
                        type: 'button',
                        onClick: dateConfirmEvent
                    }, GlobalConfig.i18n('vxe.button.confirm'))
                ]),
                h('div', {
                    ref: refInputTimeBody,
                    class: 'vxe-input--time-picker-body'
                }, [
                    h('ul', {
                        class: 'vxe-input--time-picker-hour-list'
                    }, hourList.map(function (item, index) {
                        return h('li', {
                            key: index,
                            class: {
                                'is--selected': datetimePanelValue && datetimePanelValue.getHours() === item.value
                            },
                            onClick: function (evnt) { return dateHourEvent(evnt, item); }
                        }, item.label);
                    })),
                    h('ul', {
                        class: 'vxe-input--time-picker-minute-list'
                    }, minuteList.map(function (item, index) {
                        return h('li', {
                            key: index,
                            class: {
                                'is--selected': datetimePanelValue && datetimePanelValue.getMinutes() === item.value
                            },
                            onClick: function (evnt) { return dateMinuteEvent(evnt, item); }
                        }, item.label);
                    })),
                    h('ul', {
                        class: 'vxe-input--time-picker-second-list'
                    }, secondList.map(function (item, index) {
                        return h('li', {
                            key: index,
                            class: {
                                'is--selected': datetimePanelValue && datetimePanelValue.getSeconds() === item.value
                            },
                            onClick: function (evnt) { return dateSecondEvent(evnt, item); }
                        }, item.label);
                    }))
                ])
            ];
        };
        var renderPanel = function () {
            var _a;
            var type = props.type, transfer = props.transfer;
            var inited = reactData.inited, animatVisible = reactData.animatVisible, visiblePanel = reactData.visiblePanel, panelPlacement = reactData.panelPlacement, panelStyle = reactData.panelStyle;
            var vSize = computeSize.value;
            var isDatePickerType = computeIsDatePickerType.value;
            var renders = [];
            if (isDatePickerType) {
                if (type === 'datetime') {
                    renders.push(h('div', {
                        class: 'vxe-input--panel-layout-wrapper'
                    }, [
                        h('div', {
                            class: 'vxe-input--panel-left-wrapper'
                        }, renderDatePanel()),
                        h('div', {
                            class: 'vxe-input--panel-right-wrapper'
                        }, renderTimePanel())
                    ]));
                }
                else if (type === 'time') {
                    renders.push(h('div', {
                        class: 'vxe-input--panel-wrapper'
                    }, renderTimePanel()));
                }
                else {
                    renders.push(h('div', {
                        class: 'vxe-input--panel-wrapper'
                    }, renderDatePanel()));
                }
                return h(Teleport, {
                    to: 'body',
                    disabled: transfer ? !inited : true
                }, [
                    h('div', {
                        ref: refInputPanel,
                        class: ['vxe-table--ignore-clear vxe-input--panel', "type--" + type, (_a = {},
                                _a["size--" + vSize] = vSize,
                                _a['is--transfer'] = transfer,
                                _a['animat--leave'] = animatVisible,
                                _a['animat--enter'] = visiblePanel,
                                _a)],
                        placement: panelPlacement,
                        style: panelStyle
                    }, renders)
                ]);
            }
            return null;
        };
        var renderNumberIcon = function () {
            return h('span', {
                class: 'vxe-input--number-suffix'
            }, [
                h('span', {
                    class: 'vxe-input--number-prev is--prev',
                    onMousedown: numberMousedownEvent,
                    onMouseup: numberStopDown,
                    onMouseleave: numberStopDown
                }, [
                    h('i', {
                        class: ['vxe-input--number-prev-icon', GlobalConfig.icon.INPUT_PREV_NUM]
                    })
                ]),
                h('span', {
                    class: 'vxe-input--number-next is--next',
                    onMousedown: numberMousedownEvent,
                    onMouseup: numberStopDown,
                    onMouseleave: numberStopDown
                }, [
                    h('i', {
                        class: ['vxe-input--number-next-icon', GlobalConfig.icon.INPUT_NEXT_NUM]
                    })
                ])
            ]);
        };
        var renderDatePickerIcon = function () {
            return h('span', {
                class: 'vxe-input--date-picker-suffix',
                onClick: datePickerOpenEvent
            }, [
                h('i', {
                    class: ['vxe-input--date-picker-icon', GlobalConfig.icon.INPUT_DATE]
                })
            ]);
        };
        var renderSearchIcon = function () {
            return h('span', {
                class: 'vxe-input--search-suffix',
                onClick: searchEvent
            }, [
                h('i', {
                    class: ['vxe-input--search-icon', GlobalConfig.icon.INPUT_SEARCH]
                })
            ]);
        };
        var renderPasswordIcon = function () {
            var showPwd = reactData.showPwd;
            return h('span', {
                class: 'vxe-input--password-suffix',
                onClick: passwordToggleEvent
            }, [
                h('i', {
                    class: ['vxe-input--password-icon', showPwd ? GlobalConfig.icon.INPUT_SHOW_PWD : GlobalConfig.icon.INPUT_PWD]
                })
            ]);
        };
        var rendePrefixIcon = function () {
            var prefixIcon = props.prefixIcon;
            var prefixSlot = slots.prefix;
            var icons = [];
            if (prefixSlot) {
                icons.push(h('span', {
                    class: 'vxe-input--prefix-icon'
                }, prefixSlot({})));
            }
            else if (prefixIcon) {
                icons.push(h('i', {
                    class: ['vxe-input--prefix-icon', prefixIcon]
                }));
            }
            return icons.length ? h('span', {
                class: 'vxe-input--prefix',
                onClick: clickPrefixEvent
            }, icons) : null;
        };
        var renderSuffixIcon = function () {
            var disabled = props.disabled, suffixIcon = props.suffixIcon;
            var inputValue = reactData.inputValue;
            var suffixSlot = slots.suffix;
            var isClearable = computeIsClearable.value;
            var icons = [];
            if (suffixSlot) {
                icons.push(h('span', {
                    class: 'vxe-input--suffix-icon'
                }, suffixSlot({})));
            }
            else if (suffixIcon) {
                icons.push(h('i', {
                    class: ['vxe-input--suffix-icon', suffixIcon]
                }));
            }
            if (isClearable) {
                icons.push(h('i', {
                    class: ['vxe-input--clear-icon', GlobalConfig.icon.INPUT_CLEAR]
                }));
            }
            return icons.length ? h('span', {
                class: ['vxe-input--suffix', {
                        'is--clear': isClearable && !disabled && !(inputValue === '' || XEUtils.eqNull(inputValue))
                    }],
                onClick: clickSuffixEvent
            }, icons) : null;
        };
        var renderExtraSuffixIcon = function () {
            var controls = props.controls;
            var isNumType = computeIsNumType.value;
            var isDatePickerType = computeIsDatePickerType.value;
            var isPawdType = computeIsPawdType.value;
            var isSearchType = computeIsSearchType.value;
            var icons;
            if (isPawdType) {
                icons = renderPasswordIcon();
            }
            else if (isNumType) {
                if (controls) {
                    icons = renderNumberIcon();
                }
            }
            else if (isDatePickerType) {
                icons = renderDatePickerIcon();
            }
            else if (isSearchType) {
                icons = renderSearchIcon();
            }
            return icons ? h('span', {
                class: 'vxe-input--extra-suffix'
            }, [icons]) : null;
        };
        inputMethods = {
            dispatchEvent: function (type, params, evnt) {
                emit(type, Object.assign({ $input: $xeinput, $event: evnt }, params));
            },
            focus: function () {
                var inputElem = refInputTarget.value;
                reactData.isActivated = true;
                inputElem.focus();
                return nextTick();
            },
            blur: function () {
                var inputElem = refInputTarget.value;
                inputElem.blur();
                reactData.isActivated = false;
                return nextTick();
            }
        };
        Object.assign($xeinput, inputMethods);
        watch(function () { return props.modelValue; }, function (val) {
            reactData.inputValue = val;
            changeValue();
        });
        watch(computeDateLabelFormat, function () {
            dateParseValue(reactData.datePanelValue);
            reactData.inputValue = reactData.datePanelLabel;
        });
        nextTick(function () {
            GlobalEvent.on($xeinput, 'mousewheel', handleGlobalMousewheelEvent);
            GlobalEvent.on($xeinput, 'mousedown', handleGlobalMousedownEvent);
            GlobalEvent.on($xeinput, 'keydown', handleGlobalKeydownEvent);
            GlobalEvent.on($xeinput, 'blur', handleGlobalBlurEvent);
        });
        onUnmounted(function () {
            numberStopDown();
            GlobalEvent.off($xeinput, 'mousewheel');
            GlobalEvent.off($xeinput, 'mousedown');
            GlobalEvent.off($xeinput, 'keydown');
            GlobalEvent.off($xeinput, 'blur');
        });
        initValue();
        var renderVN = function () {
            var _a;
            var className = props.className, controls = props.controls, type = props.type, align = props.align, name = props.name, disabled = props.disabled, readonly = props.readonly, autocomplete = props.autocomplete;
            var inputValue = reactData.inputValue, visiblePanel = reactData.visiblePanel, isActivated = reactData.isActivated;
            var vSize = computeSize.value;
            var isDatePickerType = computeIsDatePickerType.value;
            var inpReadonly = computeInpReadonly.value;
            var inpMaxlength = computeInpMaxlength.value;
            var inputType = computeInputType.value;
            var inpPlaceholder = computeInpPlaceholder.value;
            var childs = [];
            var prefix = rendePrefixIcon();
            var suffix = renderSuffixIcon();
            // 前缀图标
            if (prefix) {
                childs.push(prefix);
            }
            // 输入框
            childs.push(h('input', {
                ref: refInputTarget,
                class: 'vxe-input--inner',
                value: inputValue,
                name: name,
                type: inputType,
                placeholder: inpPlaceholder,
                maxlength: inpMaxlength,
                readonly: inpReadonly,
                disabled: disabled,
                autocomplete: autocomplete,
                onKeydown: keydownEvent,
                onKeyup: keyupEvent,
                onWheel: wheelEvent,
                onClick: clickEvent,
                onInput: inputEvent,
                onChange: changeEvent,
                onFocus: focusEvent,
                onBlur: blurEvent
            }));
            // 后缀图标
            if (suffix) {
                childs.push(suffix);
            }
            // 特殊功能图标
            childs.push(renderExtraSuffixIcon());
            // 面板容器
            if (isDatePickerType) {
                childs.push(renderPanel());
            }
            return h('div', {
                ref: refElem,
                class: ['vxe-input', "type--" + type, className, (_a = {},
                        _a["size--" + vSize] = vSize,
                        _a["is--" + align] = align,
                        _a['is--controls'] = controls,
                        _a['is--prefix'] = !!prefix,
                        _a['is--suffix'] = !!suffix,
                        _a['is--readonly'] = readonly,
                        _a['is--visivle'] = visiblePanel,
                        _a['is--disabled'] = disabled,
                        _a['is--active'] = isActivated,
                        _a)]
            }, childs);
        };
        $xeinput.renderVN = renderVN;
        return $xeinput;
    },
    render: function () {
        return this.renderVN();
    }
});
