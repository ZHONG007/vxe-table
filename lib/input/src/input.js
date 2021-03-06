"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _vue = require("vue");

var _xeUtils = _interopRequireDefault(require("xe-utils"));

var _conf = _interopRequireDefault(require("../../v-x-e-table/src/conf"));

var _size = require("../../hooks/size");

var _utils = require("../../tools/utils");

var _dom = require("../../tools/dom");

var _event = require("../../tools/event");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var yearSize = 20;
var monthSize = 20;
var quarterSize = 8;

function toStringTimeDate(str) {
  if (str) {
    var rest = new Date();
    var h_1 = 0;
    var m = 0;
    var s = 0;

    if (_xeUtils.default.isDate(str)) {
      h_1 = str.getHours();
      m = str.getMinutes();
      s = str.getSeconds();
    } else {
      str = _xeUtils.default.toValueString(str);
      var parses = str.match(/^(\d{1,2})(:(\d{1,2}))?(:(\d{1,2}))?/);

      if (parses) {
        h_1 = _xeUtils.default.toNumber(parses[1]);
        m = _xeUtils.default.toNumber(parses[3]);
        s = _xeUtils.default.toNumber(parses[5]);
      }
    }

    rest.setHours(h_1);
    rest.setMinutes(m);
    rest.setSeconds(s);
    return rest;
  }

  return new Date('');
}

var _default2 = (0, _vue.defineComponent)({
  name: 'VxeInput',
  props: {
    modelValue: [String, Number, Date],
    immediate: {
      type: Boolean,
      default: true
    },
    name: String,
    type: {
      type: String,
      default: 'text'
    },
    clearable: {
      type: Boolean,
      default: function _default() {
        return _conf.default.input.clearable;
      }
    },
    readonly: Boolean,
    disabled: Boolean,
    placeholder: String,
    maxlength: [String, Number],
    autocomplete: {
      type: String,
      default: 'off'
    },
    align: String,
    form: String,
    className: String,
    size: {
      type: String,
      default: function _default() {
        return _conf.default.input.size || _conf.default.size;
      }
    },
    // number???integer???float
    min: {
      type: [String, Number],
      default: null
    },
    max: {
      type: [String, Number],
      default: null
    },
    step: [String, Number],
    exponential: {
      type: Boolean,
      default: function _default() {
        return _conf.default.input.exponential;
      }
    },
    // number???integer???float???password
    controls: {
      type: Boolean,
      default: function _default() {
        return _conf.default.input.controls;
      }
    },
    // float
    digits: {
      type: [String, Number],
      default: function _default() {
        return _conf.default.input.digits;
      }
    },
    // date???week???month???quarter???year
    minDate: {
      type: [String, Number, Date],
      default: function _default() {
        return _conf.default.input.minDate;
      }
    },
    maxDate: {
      type: [String, Number, Date],
      default: function _default() {
        return _conf.default.input.maxDate;
      }
    },
    // ????????? startWeek?????? startDay ??????
    startWeek: Number,
    startDay: {
      type: [String, Number],
      default: function _default() {
        return _conf.default.input.startDay;
      }
    },
    labelFormat: {
      type: String,
      default: function _default() {
        return _conf.default.input.labelFormat;
      }
    },
    valueFormat: {
      type: String,
      default: function _default() {
        return _conf.default.input.valueFormat;
      }
    },
    editable: {
      type: Boolean,
      default: true
    },
    festivalMethod: {
      type: Function,
      default: function _default() {
        return _conf.default.input.festivalMethod;
      }
    },
    disabledMethod: {
      type: Function,
      default: function _default() {
        return _conf.default.input.disabledMethod;
      }
    },
    // week
    selectDay: {
      type: [String, Number],
      default: function _default() {
        return _conf.default.input.selectDay;
      }
    },
    prefixIcon: String,
    suffixIcon: String,
    placement: String,
    transfer: {
      type: Boolean,
      default: function _default() {
        return _conf.default.input.transfer;
      }
    }
  },
  emits: ['update:modelValue', 'input', 'change', 'keydown', 'keyup', 'wheel', 'click', 'focus', 'blur', 'clear', 'search-click', 'toggle-visible', 'prev-number', 'next-number', 'prefix-click', 'suffix-click', 'date-prev', 'date-today', 'date-next'],
  setup: function setup(props, context) {
    var slots = context.slots,
        emit = context.emit;

    var xID = _xeUtils.default.uniqueId();

    var computeSize = (0, _size.useSize)(props);
    var reactData = (0, _vue.reactive)({
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
    var refElem = (0, _vue.ref)();
    var refInputTarget = (0, _vue.ref)();
    var refInputPanel = (0, _vue.ref)();
    var refInputTimeBody = (0, _vue.ref)();
    var refMaps = {
      refElem: refElem,
      refInput: refInputTarget
    };
    var $xeinput = {
      xID: xID,
      props: props,
      context: context,
      reactData: reactData,
      getRefMaps: function getRefMaps() {
        return refMaps;
      }
    };
    var inputMethods = {};
    var computeIsDateTimeType = (0, _vue.computed)(function () {
      var type = props.type;
      return type === 'time' || type === 'datetime';
    });
    var computeIsNumType = (0, _vue.computed)(function () {
      return ['number', 'integer', 'float'].indexOf(props.type) > -1;
    });
    var computeIsDatePickerType = (0, _vue.computed)(function () {
      var isDateTimeType = computeIsDateTimeType.value;
      return isDateTimeType || ['date', 'week', 'month', 'quarter', 'year'].indexOf(props.type) > -1;
    });
    var computeIsPawdType = (0, _vue.computed)(function () {
      return props.type === 'password';
    });
    var computeIsSearchType = (0, _vue.computed)(function () {
      return props.type === 'search';
    });
    var computeDigitsValue = (0, _vue.computed)(function () {
      return _xeUtils.default.toInteger(props.digits) || 1;
    });
    var computeStepValue = (0, _vue.computed)(function () {
      var type = props.type;
      var digitsValue = computeDigitsValue.value;
      var step = props.step;

      if (type === 'integer') {
        return _xeUtils.default.toInteger(step) || 1;
      } else if (type === 'float') {
        return _xeUtils.default.toNumber(step) || 1 / Math.pow(10, digitsValue);
      }

      return _xeUtils.default.toNumber(step) || 1;
    });
    var computeIsClearable = (0, _vue.computed)(function () {
      var type = props.type;
      var isNumType = computeIsNumType.value;
      var isDatePickerType = computeIsDatePickerType.value;
      var isPawdType = computeIsPawdType.value;
      return props.clearable && (isPawdType || isNumType || isDatePickerType || type === 'text' || type === 'search');
    });
    var computeDateMinTime = (0, _vue.computed)(function () {
      return props.minDate ? _xeUtils.default.toStringDate(props.minDate) : null;
    });
    var computeDateMaxTime = (0, _vue.computed)(function () {
      return props.maxDate ? _xeUtils.default.toStringDate(props.maxDate) : null;
    });
    var computeDateValueFormat = (0, _vue.computed)(function () {
      var type = props.type;
      return type === 'time' ? 'HH:mm:ss' : props.valueFormat || (type === 'datetime' ? 'yyyy-MM-dd HH:mm:ss' : 'yyyy-MM-dd');
    });
    var computeDateValue = (0, _vue.computed)(function () {
      var modelValue = props.modelValue,
          type = props.type;
      var isDatePickerType = computeIsDatePickerType.value;
      var dateValueFormat = computeDateValueFormat.value;
      var val = null;

      if (modelValue && isDatePickerType) {
        var date = void 0;

        if (type === 'time') {
          date = toStringTimeDate(modelValue);
        } else {
          date = _xeUtils.default.toStringDate(modelValue, dateValueFormat);
        }

        if (_xeUtils.default.isValidDate(date)) {
          val = date;
        }
      }

      return val;
    });
    var computeIsDisabledPrevDateBtn = (0, _vue.computed)(function () {
      var dateMinTime = computeDateMinTime.value;
      var selectMonth = reactData.selectMonth;

      if (selectMonth && dateMinTime) {
        return selectMonth <= dateMinTime;
      }

      return false;
    });
    var computeIsDisabledNextDateBtn = (0, _vue.computed)(function () {
      var dateMaxTime = computeDateMaxTime.value;
      var selectMonth = reactData.selectMonth;

      if (selectMonth && dateMaxTime) {
        return selectMonth >= dateMaxTime;
      }

      return false;
    });
    var computeDateTimeLabel = (0, _vue.computed)(function () {
      var datetimePanelValue = reactData.datetimePanelValue;

      if (datetimePanelValue) {
        return _xeUtils.default.toDateString(datetimePanelValue, 'HH:mm:ss');
      }

      return '';
    });
    var computeDateHMSTime = (0, _vue.computed)(function () {
      var dateValue = computeDateValue.value;
      var isDateTimeType = computeIsDateTimeType.value;
      return dateValue && isDateTimeType ? (dateValue.getHours() * 3600 + dateValue.getMinutes() * 60 + dateValue.getSeconds()) * 1000 : 0;
    });
    var computeDateLabelFormat = (0, _vue.computed)(function () {
      var isDatePickerType = computeIsDatePickerType.value;

      if (isDatePickerType) {
        return props.labelFormat || _conf.default.i18n("vxe.input.date.labelFormat." + props.type);
      }

      return null;
    });
    var computeYearList = (0, _vue.computed)(function () {
      var selectMonth = reactData.selectMonth,
          currentDate = reactData.currentDate;
      var years = [];

      if (selectMonth && currentDate) {
        var currFullYear = currentDate.getFullYear();
        var startYear = new Date(_xeUtils.default.toNumber(('' + selectMonth.getFullYear()).replace(/\d{1}$/, '0')), 0, 1);

        for (var index = -10; index < yearSize - 10; index++) {
          var date = _xeUtils.default.getWhatYear(startYear, index, 'first');

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
    var computeSelectDatePanelLabel = (0, _vue.computed)(function () {
      var isDatePickerType = computeIsDatePickerType.value;

      if (isDatePickerType) {
        var datePanelType = reactData.datePanelType,
            selectMonth = reactData.selectMonth;
        var yearList = computeYearList.value;
        var year = '';
        var month = void 0;

        if (selectMonth) {
          year = selectMonth.getFullYear();
          month = selectMonth.getMonth() + 1;
        }

        if (datePanelType === 'quarter') {
          return _conf.default.i18n('vxe.input.date.quarterLabel', [year]);
        } else if (datePanelType === 'month') {
          return _conf.default.i18n('vxe.input.date.monthLabel', [year]);
        } else if (datePanelType === 'year') {
          return yearList.length ? yearList[0].year + " - " + yearList[yearList.length - 1].year : '';
        }

        return _conf.default.i18n('vxe.input.date.dayLabel', [year, month ? _conf.default.i18n("vxe.input.date.m" + month) : '-']);
      }

      return '';
    });
    var computeWeekDatas = (0, _vue.computed)(function () {
      var weeks = [];
      var isDatePickerType = computeIsDatePickerType.value;

      if (isDatePickerType) {
        var startDay = props.startDay,
            startWeek = props.startWeek;

        var sWeek = _xeUtils.default.toNumber(_xeUtils.default.isNumber(startDay) || _xeUtils.default.isString(startDay) ? startDay : startWeek);

        weeks.push(sWeek);

        for (var index = 0; index < 6; index++) {
          if (sWeek >= 6) {
            sWeek = 0;
          } else {
            sWeek++;
          }

          weeks.push(sWeek);
        }
      }

      return weeks;
    });
    var computeDateHeaders = (0, _vue.computed)(function () {
      var isDatePickerType = computeIsDatePickerType.value;

      if (isDatePickerType) {
        var weekDatas = computeWeekDatas.value;
        return weekDatas.map(function (day) {
          return {
            value: day,
            label: _conf.default.i18n("vxe.input.date.weeks.w" + day)
          };
        });
      }

      return [];
    });
    var computeWeekHeaders = (0, _vue.computed)(function () {
      var isDatePickerType = computeIsDatePickerType.value;

      if (isDatePickerType) {
        var dateHeaders = computeDateHeaders.value;
        return [{
          label: _conf.default.i18n('vxe.input.date.weeks.w')
        }].concat(dateHeaders);
      }

      return [];
    });
    var computeYearDatas = (0, _vue.computed)(function () {
      var yearList = computeYearList.value;
      return _xeUtils.default.chunk(yearList, 4);
    });

    var getDateQuarter = function getDateQuarter(date) {
      var month = date.getMonth();

      if (month < 3) {
        return 1;
      } else if (month < 6) {
        return 2;
      } else if (month < 9) {
        return 3;
      }

      return 4;
    };

    var computeQuarterList = (0, _vue.computed)(function () {
      var selectMonth = reactData.selectMonth,
          currentDate = reactData.currentDate;
      var quarters = [];

      if (selectMonth && currentDate) {
        var currFullYear = currentDate.getFullYear();
        var currQuarter = getDateQuarter(currentDate);

        var firstYear = _xeUtils.default.getWhatYear(selectMonth, 0, 'first');

        var selFullYear = firstYear.getFullYear();

        for (var index = -2; index < quarterSize - 2; index++) {
          var date = _xeUtils.default.getWhatQuarter(firstYear, index);

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
    var computeQuarterDatas = (0, _vue.computed)(function () {
      var quarterList = computeQuarterList.value;
      return _xeUtils.default.chunk(quarterList, 2);
    });
    var computeMonthList = (0, _vue.computed)(function () {
      var selectMonth = reactData.selectMonth,
          currentDate = reactData.currentDate;
      var months = [];

      if (selectMonth && currentDate) {
        var currFullYear = currentDate.getFullYear();
        var currMonth = currentDate.getMonth();

        var selFullYear = _xeUtils.default.getWhatYear(selectMonth, 0, 'first').getFullYear();

        for (var index = -4; index < monthSize - 4; index++) {
          var date = _xeUtils.default.getWhatYear(selectMonth, 0, index);

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
    var computeMonthDatas = (0, _vue.computed)(function () {
      var monthList = computeMonthList.value;
      return _xeUtils.default.chunk(monthList, 4);
    });
    var computeDayList = (0, _vue.computed)(function () {
      var selectMonth = reactData.selectMonth,
          currentDate = reactData.currentDate;
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
        var startDate = new Date(_xeUtils.default.getWhatDay(selectMonth, prevOffsetDate).getTime() + dateHMSTime);

        for (var index = 0; index < 42; index++) {
          var date = _xeUtils.default.getWhatDay(startDate, index);

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
    var computeDayDatas = (0, _vue.computed)(function () {
      var dayList = computeDayList.value;
      return _xeUtils.default.chunk(dayList, 7);
    });
    var computeWeekDates = (0, _vue.computed)(function () {
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
          label: _xeUtils.default.getYearWeek(firstItem.date)
        };
        return [item].concat(list);
      });
    });
    var computeHourList = (0, _vue.computed)(function () {
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
    var computeMinuteList = (0, _vue.computed)(function () {
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
    var computeSecondList = (0, _vue.computed)(function () {
      var minuteList = computeMinuteList.value;
      return minuteList;
    });
    var computeInpReadonly = (0, _vue.computed)(function () {
      var type = props.type,
          readonly = props.readonly,
          editable = props.editable;
      return readonly || !editable || type === 'week' || type === 'quarter';
    });
    var computeInputType = (0, _vue.computed)(function () {
      var type = props.type;
      var showPwd = reactData.showPwd;
      var isNumType = computeIsNumType.value;
      var isDatePickerType = computeIsDatePickerType.value;
      var isPawdType = computeIsPawdType.value;

      if (isDatePickerType || isNumType || isPawdType && showPwd || type === 'number') {
        return 'text';
      }

      return type;
    });
    var computeInpPlaceholder = (0, _vue.computed)(function () {
      var placeholder = props.placeholder;

      if (placeholder) {
        return (0, _utils.getFuncText)(placeholder);
      }

      return '';
    });
    var computeInpMaxlength = (0, _vue.computed)(function () {
      var maxlength = props.maxlength;
      var isNumType = computeIsNumType.value; // ???????????????????????? 16 ??????????????????

      return isNumType && !_xeUtils.default.toNumber(maxlength) ? 16 : maxlength;
    });
    var computeInpImmediate = (0, _vue.computed)(function () {
      var type = props.type,
          immediate = props.immediate;
      return immediate || !(type === 'text' || type === 'number' || type === 'integer' || type === 'float');
    });

    function getNumberValue(val) {
      var type = props.type,
          exponential = props.exponential;
      var inpMaxlength = computeInpMaxlength.value;
      var digitsValue = computeDigitsValue.value;
      var restVal = type === 'float' ? _xeUtils.default.toFixed(_xeUtils.default.floor(val, digitsValue), digitsValue) : _xeUtils.default.toValueString(val);

      if (exponential && (val === restVal || _xeUtils.default.toValueString(val).toLowerCase() === _xeUtils.default.toNumber(restVal).toExponential())) {
        return val;
      }

      return restVal.slice(0, inpMaxlength);
    }

    var triggerEvent = function triggerEvent(evnt) {
      var inputValue = reactData.inputValue;
      inputMethods.dispatchEvent(evnt.type, {
        value: inputValue
      }, evnt);
    };

    var emitModel = function emitModel(value, evnt) {
      reactData.inputValue = value;
      emit('update:modelValue', value);
      inputMethods.dispatchEvent('input', {
        value: value
      }, evnt);

      if (_xeUtils.default.toValueString(props.modelValue) !== value) {
        inputMethods.dispatchEvent('change', {
          value: value
        }, evnt);
      }
    };

    var emitInputEvent = function emitInputEvent(value, evnt) {
      var isDatePickerType = computeIsDatePickerType.value;
      var inpImmediate = computeInpImmediate.value;
      reactData.inputValue = value;

      if (!isDatePickerType) {
        if (inpImmediate) {
          emitModel(value, evnt);
        } else {
          inputMethods.dispatchEvent('input', {
            value: value
          }, evnt);
        }
      }
    };

    var inputEvent = function inputEvent(evnt) {
      var inputElem = evnt.target;
      var value = inputElem.value;
      emitInputEvent(value, evnt);
    };

    var changeEvent = function changeEvent(evnt) {
      var inpImmediate = computeInpImmediate.value;

      if (!inpImmediate) {
        triggerEvent(evnt);
      }
    };

    var focusEvent = function focusEvent(evnt) {
      reactData.isActivated = true;
      triggerEvent(evnt);
    };

    var clickPrefixEvent = function clickPrefixEvent(evnt) {
      var disabled = props.disabled;

      if (!disabled) {
        var inputValue = reactData.inputValue;
        inputMethods.dispatchEvent('prefix-click', {
          value: inputValue
        }, evnt);
      }
    };

    var hidePanelTimeout;

    var hidePanel = function hidePanel() {
      reactData.visiblePanel = false;
      hidePanelTimeout = window.setTimeout(function () {
        reactData.animatVisible = false;
      }, 350);
    };

    var clearValueEvent = function clearValueEvent(evnt, value) {
      var type = props.type;
      var isNumType = computeIsNumType.value;
      var isDatePickerType = computeIsDatePickerType.value;

      if (isDatePickerType) {
        hidePanel();
      }

      if (isNumType || ['text', 'search', 'password'].indexOf(type) > -1) {
        focus();
      }

      inputMethods.dispatchEvent('clear', {
        value: value
      }, evnt);
    };

    var clickSuffixEvent = function clickSuffixEvent(evnt) {
      var disabled = props.disabled;

      if (!disabled) {
        if ((0, _dom.hasClass)(evnt.currentTarget, 'is--clear')) {
          emitModel('', evnt);
          clearValueEvent(evnt, '');
        } else {
          var inputValue = reactData.inputValue;
          inputMethods.dispatchEvent('suffix-click', {
            value: inputValue
          }, evnt);
        }
      }
    };

    var dateParseValue = function dateParseValue(value) {
      var type = props.type;
      var valueFormat = props.valueFormat;
      var dateLabelFormat = computeDateLabelFormat.value;
      var dValue = null;
      var dLabel = '';

      if (value) {
        if (type === 'time') {
          dValue = toStringTimeDate(value);
        } else {
          dValue = _xeUtils.default.toStringDate(value, valueFormat);
        }
      }

      if (_xeUtils.default.isValidDate(dValue)) {
        dLabel = _xeUtils.default.toDateString(dValue, dateLabelFormat);
      } else {
        dValue = null;
      }

      reactData.datePanelValue = dValue;
      reactData.datePanelLabel = dLabel;
    };
    /**
     * ??????????????????
     */


    var changeValue = function changeValue() {
      var isDatePickerType = computeIsDatePickerType.value;
      var inputValue = reactData.inputValue;

      if (isDatePickerType) {
        dateParseValue(inputValue);
        reactData.inputValue = reactData.datePanelLabel;
      }
    };
    /**
     * ???????????????
     */


    var initValue = function initValue() {
      var type = props.type;
      var inputValue = reactData.inputValue;
      var isDatePickerType = computeIsDatePickerType.value;
      var digitsValue = computeDigitsValue.value;

      if (isDatePickerType) {
        changeValue();
      } else if (type === 'float') {
        if (inputValue) {
          var validValue = _xeUtils.default.toFixed(_xeUtils.default.floor(inputValue, digitsValue), digitsValue);

          if (inputValue !== validValue) {
            emitModel(validValue, {
              type: 'init'
            });
          }
        }
      }
    };

    var vaildMaxNum = function vaildMaxNum(num) {
      return props.max === null || _xeUtils.default.toNumber(num) <= _xeUtils.default.toNumber(props.max);
    };

    var vaildMinNum = function vaildMinNum(num) {
      return props.min === null || _xeUtils.default.toNumber(num) >= _xeUtils.default.toNumber(props.min);
    };

    var dateRevert = function dateRevert() {
      reactData.inputValue = reactData.datePanelLabel;
    };

    var dateCheckMonth = function dateCheckMonth(date) {
      var month = _xeUtils.default.getWhatMonth(date, 0, 'first');

      if (!_xeUtils.default.isEqual(month, reactData.selectMonth)) {
        reactData.selectMonth = month;
      }
    };

    var dateChange = function dateChange(date) {
      var modelValue = props.modelValue;
      var datetimePanelValue = reactData.datetimePanelValue;
      var isDateTimeType = computeIsDateTimeType.value;
      var dateValueFormat = computeDateValueFormat.value;

      if (props.type === 'week') {
        var sWeek = _xeUtils.default.toNumber(props.selectDay);

        date = _xeUtils.default.getWhatWeek(date, 0, sWeek);
      } else if (isDateTimeType) {
        date.setHours(datetimePanelValue.getHours());
        date.setMinutes(datetimePanelValue.getMinutes());
        date.setSeconds(datetimePanelValue.getSeconds());
      }

      var inpVal = _xeUtils.default.toDateString(date, dateValueFormat);

      dateCheckMonth(date);

      if (!_xeUtils.default.isEqual(modelValue, inpVal)) {
        emitModel(inpVal, {
          type: 'update'
        });
      }
    };

    var afterCheckValue = function afterCheckValue() {
      var type = props.type,
          min = props.min,
          max = props.max,
          exponential = props.exponential;
      var inputValue = reactData.inputValue,
          datetimePanelValue = reactData.datetimePanelValue;
      var isNumType = computeIsNumType.value;
      var isDatePickerType = computeIsDatePickerType.value;
      var dateLabelFormat = computeDateLabelFormat.value;
      var inpReadonly = computeInpReadonly.value;

      if (!inpReadonly) {
        if (isNumType) {
          if (inputValue) {
            var inpNumVal = type === 'integer' ? _xeUtils.default.toInteger(inputValue) : _xeUtils.default.toNumber(inputValue);

            if (!vaildMinNum(inpNumVal)) {
              inpNumVal = min;
            } else if (!vaildMaxNum(inpNumVal)) {
              inpNumVal = max;
            }

            if (exponential) {
              var inpStringVal = _xeUtils.default.toValueString(inputValue).toLowerCase();

              if (inpStringVal === _xeUtils.default.toNumber(inpNumVal).toExponential()) {
                inpNumVal = inpStringVal;
              }
            }

            emitModel(getNumberValue(inpNumVal), {
              type: 'check'
            });
          }
        } else if (isDatePickerType) {
          if (inputValue) {
            var inpDateVal = void 0;

            if (type === 'time') {
              inpDateVal = toStringTimeDate(inputValue);
            } else {
              inpDateVal = _xeUtils.default.toStringDate(inputValue, dateLabelFormat);
            }

            if (_xeUtils.default.isValidDate(inpDateVal)) {
              if (type === 'time') {
                inpDateVal = _xeUtils.default.toDateString(inpDateVal, dateLabelFormat);

                if (inputValue !== inpDateVal) {
                  emitModel(inpDateVal, {
                    type: 'check'
                  });
                }

                reactData.inputValue = inpDateVal;
              } else {
                var isChange = false;

                if (type === 'datetime') {
                  var dateValue = computeDateValue.value;

                  if (inputValue !== _xeUtils.default.toDateString(dateValue, dateLabelFormat) || inputValue !== _xeUtils.default.toDateString(inpDateVal, dateLabelFormat)) {
                    isChange = true;
                    datetimePanelValue.setHours(inpDateVal.getHours());
                    datetimePanelValue.setMinutes(inpDateVal.getMinutes());
                    datetimePanelValue.setSeconds(inpDateVal.getSeconds());
                  }
                } else {
                  isChange = true;
                }

                reactData.inputValue = _xeUtils.default.toDateString(inpDateVal, dateLabelFormat);

                if (isChange) {
                  dateChange(inpDateVal);
                }
              }
            } else {
              dateRevert();
            }
          } else {
            emitModel('', {
              type: 'check'
            });
          }
        }
      }
    };

    var blurEvent = function blurEvent(evnt) {
      var inputValue = reactData.inputValue;
      var inpImmediate = computeInpImmediate.value;

      if (!inpImmediate) {
        emitModel(inputValue, evnt);
      }

      afterCheckValue();

      if (!reactData.visiblePanel) {
        reactData.isActivated = false;
      }

      inputMethods.dispatchEvent('blur', {
        value: inputValue
      }, evnt);
    }; // ??????


    var passwordToggleEvent = function passwordToggleEvent(evnt) {
      var readonly = props.readonly,
          disabled = props.disabled;
      var showPwd = reactData.showPwd;

      if (!disabled && !readonly) {
        reactData.showPwd = !showPwd;
      }

      inputMethods.dispatchEvent('toggle-visible', {
        visible: reactData.showPwd
      }, evnt);
    }; // ??????
    // ??????


    var searchEvent = function searchEvent(evnt) {
      inputMethods.dispatchEvent('search-click', {}, evnt);
    }; // ??????
    // ??????


    var numberChange = function numberChange(isPlus, evnt) {
      var min = props.min,
          max = props.max,
          type = props.type;
      var inputValue = reactData.inputValue;
      var stepValue = computeStepValue.value;
      var numValue = type === 'integer' ? _xeUtils.default.toInteger(inputValue) : _xeUtils.default.toNumber(inputValue);
      var newValue = isPlus ? _xeUtils.default.add(numValue, stepValue) : _xeUtils.default.subtract(numValue, stepValue);
      var restNum;

      if (!vaildMinNum(newValue)) {
        restNum = min;
      } else if (!vaildMaxNum(newValue)) {
        restNum = max;
      } else {
        restNum = newValue;
      }

      emitInputEvent(getNumberValue(restNum), evnt);
    };

    var downbumTimeout;

    var numberNextEvent = function numberNextEvent(evnt) {
      var readonly = props.readonly,
          disabled = props.disabled;
      clearTimeout(downbumTimeout);

      if (!disabled && !readonly) {
        numberChange(false, evnt);
      }

      inputMethods.dispatchEvent('next-number', {}, evnt);
    };

    var numberDownNextEvent = function numberDownNextEvent(evnt) {
      downbumTimeout = window.setTimeout(function () {
        numberNextEvent(evnt);
        numberDownNextEvent(evnt);
      }, 60);
    };

    var numberPrevEvent = function numberPrevEvent(evnt) {
      var readonly = props.readonly,
          disabled = props.disabled;
      clearTimeout(downbumTimeout);

      if (!disabled && !readonly) {
        numberChange(true, evnt);
      }

      inputMethods.dispatchEvent('prev-number', {}, evnt);
    };

    var numberKeydownEvent = function numberKeydownEvent(evnt) {
      var isUpArrow = (0, _event.hasEventKey)(evnt, _event.EVENT_KEYS.ARROW_UP);
      var isDwArrow = (0, _event.hasEventKey)(evnt, _event.EVENT_KEYS.ARROW_DOWN);

      if (isUpArrow || isDwArrow) {
        evnt.preventDefault();

        if (isUpArrow) {
          numberPrevEvent(evnt);
        } else {
          numberNextEvent(evnt);
        }
      }
    };

    var keydownEvent = function keydownEvent(evnt) {
      var exponential = props.exponential,
          controls = props.controls;
      var isNumType = computeIsNumType.value;

      if (isNumType) {
        var isCtrlKey = evnt.ctrlKey;
        var isShiftKey = evnt.shiftKey;
        var isAltKey = evnt.altKey;
        var keyCode = evnt.keyCode;

        if (!isCtrlKey && !isShiftKey && !isAltKey && ((0, _event.hasEventKey)(evnt, _event.EVENT_KEYS.SPACEBAR) || (!exponential || keyCode !== 69) && keyCode >= 65 && keyCode <= 90 || keyCode >= 186 && keyCode <= 188 || keyCode >= 191)) {
          evnt.preventDefault();
        }

        if (controls) {
          numberKeydownEvent(evnt);
        }
      }

      triggerEvent(evnt);
    };

    var keyupEvent = function keyupEvent(evnt) {
      triggerEvent(evnt);
    }; // ??????


    var numberStopDown = function numberStopDown() {
      clearTimeout(downbumTimeout);
    };

    var numberDownPrevEvent = function numberDownPrevEvent(evnt) {
      downbumTimeout = window.setTimeout(function () {
        numberPrevEvent(evnt);
        numberDownPrevEvent(evnt);
      }, 60);
    };

    var numberMousedownEvent = function numberMousedownEvent(evnt) {
      numberStopDown();

      if (evnt.button === 0) {
        var isPrevNumber_1 = (0, _dom.hasClass)(evnt.currentTarget, 'is--prev');

        if (isPrevNumber_1) {
          numberPrevEvent(evnt);
        } else {
          numberNextEvent(evnt);
        }

        downbumTimeout = window.setTimeout(function () {
          if (isPrevNumber_1) {
            numberDownPrevEvent(evnt);
          } else {
            numberDownNextEvent(evnt);
          }
        }, 500);
      }
    };

    var wheelEvent = function wheelEvent(evnt) {
      var isNumType = computeIsNumType.value;

      if (isNumType && props.controls) {
        if (reactData.isActivated) {
          var delta = evnt.deltaY;

          if (delta > 0) {
            numberNextEvent(evnt);
          } else if (delta < 0) {
            numberPrevEvent(evnt);
          }

          evnt.preventDefault();
        }
      }

      triggerEvent(evnt);
    }; // ??????


    var dateMonthHandle = function dateMonthHandle(date, offsetMonth) {
      reactData.selectMonth = _xeUtils.default.getWhatMonth(date, offsetMonth, 'first');
    };

    var dateNowHandle = function dateNowHandle() {
      var currentDate = _xeUtils.default.getWhatDay(Date.now(), 0, 'first');

      reactData.currentDate = currentDate;
      dateMonthHandle(currentDate, 0);
    };

    var dateToggleTypeEvent = function dateToggleTypeEvent() {
      var datePanelType = reactData.datePanelType;

      if (datePanelType === 'month' || datePanelType === 'quarter') {
        datePanelType = 'year';
      } else {
        datePanelType = 'month';
      }

      reactData.datePanelType = datePanelType;
    };

    var datePrevEvent = function datePrevEvent(evnt) {
      var type = props.type;
      var datePanelType = reactData.datePanelType,
          selectMonth = reactData.selectMonth;
      var isDisabledPrevDateBtn = computeIsDisabledPrevDateBtn.value;

      if (!isDisabledPrevDateBtn) {
        if (type === 'year') {
          reactData.selectMonth = _xeUtils.default.getWhatYear(selectMonth, -yearSize, 'first');
        } else if (type === 'month' || type === 'quarter') {
          if (datePanelType === 'year') {
            reactData.selectMonth = _xeUtils.default.getWhatYear(selectMonth, -yearSize, 'first');
          } else {
            reactData.selectMonth = _xeUtils.default.getWhatYear(selectMonth, -1, 'first');
          }
        } else {
          if (datePanelType === 'year') {
            reactData.selectMonth = _xeUtils.default.getWhatYear(selectMonth, -yearSize, 'first');
          } else if (datePanelType === 'month') {
            reactData.selectMonth = _xeUtils.default.getWhatYear(selectMonth, -1, 'first');
          } else {
            reactData.selectMonth = _xeUtils.default.getWhatMonth(selectMonth, -1, 'first');
          }
        }

        inputMethods.dispatchEvent('date-prev', {
          type: type
        }, evnt);
      }
    };

    var dateTodayMonthEvent = function dateTodayMonthEvent(evnt) {
      dateNowHandle();
      dateChange(reactData.currentDate);
      hidePanel();
      inputMethods.dispatchEvent('date-today', {
        type: props.type
      }, evnt);
    };

    var dateNextEvent = function dateNextEvent(evnt) {
      var type = props.type;
      var datePanelType = reactData.datePanelType,
          selectMonth = reactData.selectMonth;
      var isDisabledNextDateBtn = computeIsDisabledNextDateBtn.value;

      if (!isDisabledNextDateBtn) {
        if (type === 'year') {
          reactData.selectMonth = _xeUtils.default.getWhatYear(selectMonth, yearSize, 'first');
        } else if (type === 'month' || type === 'quarter') {
          if (datePanelType === 'year') {
            reactData.selectMonth = _xeUtils.default.getWhatYear(selectMonth, yearSize, 'first');
          } else {
            reactData.selectMonth = _xeUtils.default.getWhatYear(selectMonth, 1, 'first');
          }
        } else {
          if (datePanelType === 'year') {
            reactData.selectMonth = _xeUtils.default.getWhatYear(selectMonth, yearSize, 'first');
          } else if (datePanelType === 'month') {
            reactData.selectMonth = _xeUtils.default.getWhatYear(selectMonth, 1, 'first');
          } else {
            reactData.selectMonth = _xeUtils.default.getWhatMonth(selectMonth, 1, 'first');
          }
        }

        inputMethods.dispatchEvent('date-next', {
          type: type
        }, evnt);
      }
    };

    var isDateDisabled = function isDateDisabled(item) {
      var disabledMethod = props.disabledMethod;
      var datePanelType = reactData.datePanelType;
      return disabledMethod && disabledMethod({
        type: datePanelType,
        viewType: datePanelType,
        date: item.date,
        $input: $xeinput
      });
    };

    var dateSelectItem = function dateSelectItem(date) {
      var type = props.type;
      var datePanelType = reactData.datePanelType;

      if (type === 'month') {
        if (datePanelType === 'year') {
          reactData.datePanelType = 'month';
          dateCheckMonth(date);
        } else {
          dateChange(date);
          hidePanel();
        }
      } else if (type === 'year') {
        dateChange(date);
        hidePanel();
      } else if (type === 'quarter') {
        if (datePanelType === 'year') {
          reactData.datePanelType = 'quarter';
          dateCheckMonth(date);
        } else {
          dateChange(date);
          hidePanel();
        }
      } else {
        if (datePanelType === 'month') {
          reactData.datePanelType = type === 'week' ? type : 'day';
          dateCheckMonth(date);
        } else if (datePanelType === 'year') {
          reactData.datePanelType = 'month';
          dateCheckMonth(date);
        } else {
          dateChange(date);
          hidePanel();
        }
      }
    };

    var dateSelectEvent = function dateSelectEvent(item) {
      if (!isDateDisabled(item)) {
        dateSelectItem(item.date);
      }
    };

    var dateMoveDay = function dateMoveDay(offsetDay) {
      if (!isDateDisabled({
        date: offsetDay
      })) {
        var dayList = computeDayList.value;

        if (!dayList.some(function (item) {
          return _xeUtils.default.isDateSame(item.date, offsetDay, 'yyyyMMdd');
        })) {
          dateCheckMonth(offsetDay);
        }

        dateParseValue(offsetDay);
      }
    };

    var dateMoveYear = function dateMoveYear(offsetYear) {
      if (!isDateDisabled({
        date: offsetYear
      })) {
        var yearList = computeYearList.value;

        if (!yearList.some(function (item) {
          return _xeUtils.default.isDateSame(item.date, offsetYear, 'yyyy');
        })) {
          dateCheckMonth(offsetYear);
        }

        dateParseValue(offsetYear);
      }
    };

    var dateMoveQuarter = function dateMoveQuarter(offsetQuarter) {
      if (!isDateDisabled({
        date: offsetQuarter
      })) {
        var quarterList = computeQuarterList.value;

        if (!quarterList.some(function (item) {
          return _xeUtils.default.isDateSame(item.date, offsetQuarter, 'yyyyq');
        })) {
          dateCheckMonth(offsetQuarter);
        }

        dateParseValue(offsetQuarter);
      }
    };

    var dateMoveMonth = function dateMoveMonth(offsetMonth) {
      if (!isDateDisabled({
        date: offsetMonth
      })) {
        var monthList = computeMonthList.value;

        if (!monthList.some(function (item) {
          return _xeUtils.default.isDateSame(item.date, offsetMonth, 'yyyyMM');
        })) {
          dateCheckMonth(offsetMonth);
        }

        dateParseValue(offsetMonth);
      }
    };

    var dateMouseenterEvent = function dateMouseenterEvent(item) {
      if (!isDateDisabled(item)) {
        var datePanelType = reactData.datePanelType;

        if (datePanelType === 'month') {
          dateMoveMonth(item.date);
        } else if (datePanelType === 'quarter') {
          dateMoveQuarter(item.date);
        } else if (datePanelType === 'year') {
          dateMoveYear(item.date);
        } else {
          dateMoveDay(item.date);
        }
      }
    };

    var updateTimePos = function updateTimePos(liElem) {
      if (liElem) {
        var height = liElem.offsetHeight;
        var ulElem = liElem.parentNode;
        ulElem.scrollTop = liElem.offsetTop - height * 4;
      }
    };

    var dateTimeChangeEvent = function dateTimeChangeEvent(evnt) {
      reactData.datetimePanelValue = new Date(reactData.datetimePanelValue.getTime());
      updateTimePos(evnt.currentTarget);
    };

    var dateHourEvent = function dateHourEvent(evnt, item) {
      reactData.datetimePanelValue.setHours(item.value);
      dateTimeChangeEvent(evnt);
    };

    var dateConfirmEvent = function dateConfirmEvent() {
      var dateValue = computeDateValue.value;
      dateChange(dateValue || reactData.currentDate);
      hidePanel();
    };

    var dateMinuteEvent = function dateMinuteEvent(evnt, item) {
      reactData.datetimePanelValue.setMinutes(item.value);
      dateTimeChangeEvent(evnt);
    };

    var dateSecondEvent = function dateSecondEvent(evnt, item) {
      reactData.datetimePanelValue.setSeconds(item.value);
      dateTimeChangeEvent(evnt);
    };

    var dateOffsetEvent = function dateOffsetEvent(evnt) {
      var isActivated = reactData.isActivated,
          datePanelValue = reactData.datePanelValue,
          datePanelType = reactData.datePanelType;

      if (isActivated) {
        evnt.preventDefault();
        var isLeftArrow = (0, _event.hasEventKey)(evnt, _event.EVENT_KEYS.ARROW_LEFT);
        var isUpArrow = (0, _event.hasEventKey)(evnt, _event.EVENT_KEYS.ARROW_UP);
        var isRightArrow = (0, _event.hasEventKey)(evnt, _event.EVENT_KEYS.ARROW_RIGHT);
        var isDwArrow = (0, _event.hasEventKey)(evnt, _event.EVENT_KEYS.ARROW_DOWN);

        if (datePanelType === 'year') {
          var offsetYear = _xeUtils.default.getWhatYear(datePanelValue || Date.now(), 0, 'first');

          if (isLeftArrow) {
            offsetYear = _xeUtils.default.getWhatYear(offsetYear, -1);
          } else if (isUpArrow) {
            offsetYear = _xeUtils.default.getWhatYear(offsetYear, -4);
          } else if (isRightArrow) {
            offsetYear = _xeUtils.default.getWhatYear(offsetYear, 1);
          } else if (isDwArrow) {
            offsetYear = _xeUtils.default.getWhatYear(offsetYear, 4);
          }

          dateMoveYear(offsetYear);
        } else if (datePanelType === 'quarter') {
          var offsetQuarter = _xeUtils.default.getWhatQuarter(datePanelValue || Date.now(), 0, 'first');

          if (isLeftArrow) {
            offsetQuarter = _xeUtils.default.getWhatQuarter(offsetQuarter, -1);
          } else if (isUpArrow) {
            offsetQuarter = _xeUtils.default.getWhatQuarter(offsetQuarter, -2);
          } else if (isRightArrow) {
            offsetQuarter = _xeUtils.default.getWhatQuarter(offsetQuarter, 1);
          } else if (isDwArrow) {
            offsetQuarter = _xeUtils.default.getWhatQuarter(offsetQuarter, 2);
          }

          dateMoveQuarter(offsetQuarter);
        } else if (datePanelType === 'month') {
          var offsetMonth = _xeUtils.default.getWhatMonth(datePanelValue || Date.now(), 0, 'first');

          if (isLeftArrow) {
            offsetMonth = _xeUtils.default.getWhatMonth(offsetMonth, -1);
          } else if (isUpArrow) {
            offsetMonth = _xeUtils.default.getWhatMonth(offsetMonth, -4);
          } else if (isRightArrow) {
            offsetMonth = _xeUtils.default.getWhatMonth(offsetMonth, 1);
          } else if (isDwArrow) {
            offsetMonth = _xeUtils.default.getWhatMonth(offsetMonth, 4);
          }

          dateMoveMonth(offsetMonth);
        } else {
          var offsetDay = datePanelValue || _xeUtils.default.getWhatDay(Date.now(), 0, 'first');

          if (isLeftArrow) {
            offsetDay = _xeUtils.default.getWhatDay(offsetDay, -1);
          } else if (isUpArrow) {
            offsetDay = _xeUtils.default.getWhatWeek(offsetDay, -1);
          } else if (isRightArrow) {
            offsetDay = _xeUtils.default.getWhatDay(offsetDay, 1);
          } else if (isDwArrow) {
            offsetDay = _xeUtils.default.getWhatWeek(offsetDay, 1);
          }

          dateMoveDay(offsetDay);
        }
      }
    };

    var datePgOffsetEvent = function datePgOffsetEvent(evnt) {
      var isActivated = reactData.isActivated;

      if (isActivated) {
        var isPgUp = (0, _event.hasEventKey)(evnt, _event.EVENT_KEYS.PAGE_UP);
        evnt.preventDefault();

        if (isPgUp) {
          datePrevEvent(evnt);
        } else {
          dateNextEvent(evnt);
        }
      }
    };

    var dateOpenPanel = function dateOpenPanel() {
      var type = props.type;
      var isDateTimeType = computeIsDateTimeType.value;
      var dateValue = computeDateValue.value;

      if (['year', 'quarter', 'month', 'week'].indexOf(type) > -1) {
        reactData.datePanelType = type;
      } else {
        reactData.datePanelType = 'day';
      }

      reactData.currentDate = _xeUtils.default.getWhatDay(Date.now(), 0, 'first');

      if (dateValue) {
        dateMonthHandle(dateValue, 0);
        dateParseValue(dateValue);
      } else {
        dateNowHandle();
      }

      if (isDateTimeType) {
        reactData.datetimePanelValue = reactData.datePanelValue || _xeUtils.default.getWhatDay(Date.now(), 0, 'first');
        (0, _vue.nextTick)(function () {
          var timeBodyElem = refInputTimeBody.value;

          _xeUtils.default.arrayEach(timeBodyElem.querySelectorAll('li.is--selected'), updateTimePos);
        });
      }
    }; // ??????
    // ????????????


    var updateZindex = function updateZindex() {
      if (reactData.panelIndex < (0, _utils.getLastZIndex)()) {
        reactData.panelIndex = (0, _utils.nextZIndex)();
      }
    };

    var updatePlacement = function updatePlacement() {
      return (0, _vue.nextTick)().then(function () {
        var transfer = props.transfer,
            placement = props.placement;
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

          var _a = (0, _dom.getAbsolutePos)(targetElem),
              boundingTop = _a.boundingTop,
              boundingLeft = _a.boundingLeft,
              visibleHeight = _a.visibleHeight,
              visibleWidth = _a.visibleWidth;

          var panelPlacement = 'bottom';

          if (transfer) {
            var left = boundingLeft;
            var top_1 = boundingTop + targetHeight;

            if (placement === 'top') {
              panelPlacement = 'top';
              top_1 = boundingTop - panelHeight;
            } else if (!placement) {
              // ?????????????????????????????????
              if (top_1 + panelHeight + marginSize > visibleHeight) {
                panelPlacement = 'top';
                top_1 = boundingTop - panelHeight;
              } // ?????????????????????????????????????????????


              if (top_1 < marginSize) {
                panelPlacement = 'bottom';
                top_1 = boundingTop + targetHeight;
              }
            } // ??????????????????


            if (left + panelWidth + marginSize > visibleWidth) {
              left -= left + panelWidth + marginSize - visibleWidth;
            } // ??????????????????


            if (left < marginSize) {
              left = marginSize;
            }

            Object.assign(panelStyle, {
              left: left + "px",
              top: top_1 + "px",
              minWidth: targetWidth + "px"
            });
          } else {
            if (placement === 'top') {
              panelPlacement = 'top';
              panelStyle.bottom = targetHeight + "px";
            } else if (!placement) {
              // ?????????????????????????????????
              if (boundingTop + targetHeight + panelHeight > visibleHeight) {
                // ?????????????????????????????????????????????
                if (boundingTop - targetHeight - panelHeight > marginSize) {
                  panelPlacement = 'top';
                  panelStyle.bottom = targetHeight + "px";
                }
              }
            }
          }

          reactData.panelStyle = panelStyle;
          reactData.panelPlacement = panelPlacement;
          return (0, _vue.nextTick)();
        }
      });
    };

    var showPanel = function showPanel() {
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

    var datePickerOpenEvent = function datePickerOpenEvent(evnt) {
      var readonly = props.readonly;

      if (!readonly) {
        evnt.preventDefault();
        showPanel();
      }
    };

    var clickEvent = function clickEvent(evnt) {
      var isDatePickerType = computeIsDatePickerType.value;

      if (isDatePickerType) {
        datePickerOpenEvent(evnt);
      }

      triggerEvent(evnt);
    }; // ????????????
    // ????????????


    var handleGlobalMousedownEvent = function handleGlobalMousedownEvent(evnt) {
      var disabled = props.disabled;
      var visiblePanel = reactData.visiblePanel,
          isActivated = reactData.isActivated;
      var isDatePickerType = computeIsDatePickerType.value;
      var el = refElem.value;
      var panelElem = refInputPanel.value;

      if (!disabled && isActivated) {
        reactData.isActivated = (0, _dom.getEventTargetNode)(evnt, el).flag || (0, _dom.getEventTargetNode)(evnt, panelElem).flag;

        if (!reactData.isActivated) {
          // ?????????????????????
          if (isDatePickerType) {
            if (visiblePanel) {
              hidePanel();
              afterCheckValue();
            }
          } else {
            afterCheckValue();
          }
        }
      }
    };

    var handleGlobalKeydownEvent = function handleGlobalKeydownEvent(evnt) {
      var clearable = props.clearable,
          disabled = props.disabled;
      var visiblePanel = reactData.visiblePanel;
      var isDatePickerType = computeIsDatePickerType.value;

      if (!disabled) {
        var isTab = (0, _event.hasEventKey)(evnt, _event.EVENT_KEYS.TAB);
        var isDel = (0, _event.hasEventKey)(evnt, _event.EVENT_KEYS.DELETE);
        var isEsc = (0, _event.hasEventKey)(evnt, _event.EVENT_KEYS.ESCAPE);
        var isEnter = (0, _event.hasEventKey)(evnt, _event.EVENT_KEYS.ENTER);
        var isLeftArrow = (0, _event.hasEventKey)(evnt, _event.EVENT_KEYS.ARROW_LEFT);
        var isUpArrow = (0, _event.hasEventKey)(evnt, _event.EVENT_KEYS.ARROW_UP);
        var isRightArrow = (0, _event.hasEventKey)(evnt, _event.EVENT_KEYS.ARROW_RIGHT);
        var isDwArrow = (0, _event.hasEventKey)(evnt, _event.EVENT_KEYS.ARROW_DOWN);
        var isPgUp = (0, _event.hasEventKey)(evnt, _event.EVENT_KEYS.PAGE_UP);
        var isPgDn = (0, _event.hasEventKey)(evnt, _event.EVENT_KEYS.PAGE_DOWN);
        var operArrow = isLeftArrow || isUpArrow || isRightArrow || isDwArrow;
        var isActivated = reactData.isActivated;

        if (isTab) {
          if (isActivated) {
            afterCheckValue();
          }

          isActivated = false;
          reactData.isActivated = isActivated;
        } else if (operArrow) {
          if (isDatePickerType) {
            if (isActivated) {
              if (visiblePanel) {
                dateOffsetEvent(evnt);
              } else if (isUpArrow || isDwArrow) {
                datePickerOpenEvent(evnt);
              }
            }
          }
        } else if (isEnter) {
          if (isDatePickerType) {
            if (visiblePanel) {
              if (reactData.datePanelValue) {
                dateSelectItem(reactData.datePanelValue);
              } else {
                hidePanel();
              }
            } else if (isActivated) {
              datePickerOpenEvent(evnt);
            }
          }
        } else if (isPgUp || isPgDn) {
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
        } else if (isDel && clearable) {
          if (isActivated) {
            clearValueEvent(evnt, null);
          }
        }
      }
    };

    var handleGlobalMousewheelEvent = function handleGlobalMousewheelEvent(evnt) {
      var disabled = props.disabled;
      var visiblePanel = reactData.visiblePanel;

      if (!disabled) {
        if (visiblePanel) {
          var panelElem = refInputPanel.value;

          if ((0, _dom.getEventTargetNode)(evnt, panelElem).flag) {
            updatePlacement();
          } else {
            hidePanel();
            afterCheckValue();
          }
        }
      }
    };

    var handleGlobalBlurEvent = function handleGlobalBlurEvent() {
      var isActivated = reactData.isActivated,
          visiblePanel = reactData.visiblePanel;

      if (visiblePanel) {
        hidePanel();
        afterCheckValue();
      } else if (isActivated) {
        afterCheckValue();
      }
    };

    var renderDateLabel = function renderDateLabel(item, label) {
      var festivalMethod = props.festivalMethod;

      if (festivalMethod) {
        var datePanelType = reactData.datePanelType;
        var festivalRest = festivalMethod({
          type: datePanelType,
          viewType: datePanelType,
          date: item.date,
          $input: $xeinput
        });
        var festivalItem = festivalRest ? _xeUtils.default.isString(festivalRest) ? {
          label: festivalRest
        } : festivalRest : {};
        var extraItem = festivalItem.extra ? _xeUtils.default.isString(festivalItem.extra) ? {
          label: festivalItem.extra
        } : festivalItem.extra : null;
        var labels = [(0, _vue.h)('span', {
          class: ['vxe-input--date-label', {
            'is-notice': festivalItem.notice
          }]
        }, extraItem && extraItem.label ? [(0, _vue.h)('span', label), (0, _vue.h)('span', {
          class: ['vxe-input--date-label--extra', extraItem.important ? 'is-important' : '', extraItem.className],
          style: extraItem.style
        }, _xeUtils.default.toValueString(extraItem.label))] : label)];
        var festivalLabel = festivalItem.label;

        if (festivalLabel) {
          // ??????????????????3???????????????
          var festivalLabels = _xeUtils.default.toValueString(festivalLabel).split(',');

          labels.push((0, _vue.h)('span', {
            class: ['vxe-input--date-festival', festivalItem.important ? 'is-important' : '', festivalItem.className],
            style: festivalItem.style
          }, [festivalLabels.length > 1 ? (0, _vue.h)('span', {
            class: ['vxe-input--date-festival--overlap', "overlap--" + festivalLabels.length]
          }, festivalLabels.map(function (label) {
            return (0, _vue.h)('span', label.substring(0, 3));
          })) : (0, _vue.h)('span', {
            class: 'vxe-input--date-festival--label'
          }, festivalLabels[0].substring(0, 3))]));
        }

        return labels;
      }

      return label;
    };

    var renderDateDayTable = function renderDateDayTable() {
      var datePanelType = reactData.datePanelType,
          datePanelValue = reactData.datePanelValue;
      var dateValue = computeDateValue.value;
      var dateHeaders = computeDateHeaders.value;
      var dayDatas = computeDayDatas.value;
      var matchFormat = 'yyyyMMdd';
      return [(0, _vue.h)('table', {
        class: "vxe-input--date-" + datePanelType + "-view",
        cellspacing: 0,
        cellpadding: 0,
        border: 0
      }, [(0, _vue.h)('thead', [(0, _vue.h)('tr', dateHeaders.map(function (item) {
        return (0, _vue.h)('th', item.label);
      }))]), (0, _vue.h)('tbody', dayDatas.map(function (rows) {
        return (0, _vue.h)('tr', rows.map(function (item) {
          return (0, _vue.h)('td', {
            class: {
              'is--prev': item.isPrev,
              'is--current': item.isCurrent,
              'is--now': item.isNow,
              'is--next': item.isNext,
              'is--disabled': isDateDisabled(item),
              'is--selected': _xeUtils.default.isDateSame(dateValue, item.date, matchFormat),
              'is--hover': _xeUtils.default.isDateSame(datePanelValue, item.date, matchFormat)
            },
            onClick: function onClick() {
              return dateSelectEvent(item);
            },
            onMouseenter: function onMouseenter() {
              return dateMouseenterEvent(item);
            }
          }, renderDateLabel(item, item.label));
        }));
      }))])];
    };

    var renderDateWeekTable = function renderDateWeekTable() {
      var datePanelType = reactData.datePanelType,
          datePanelValue = reactData.datePanelValue;
      var dateValue = computeDateValue.value;
      var weekHeaders = computeWeekHeaders.value;
      var weekDates = computeWeekDates.value;
      var matchFormat = 'yyyyMMdd';
      return [(0, _vue.h)('table', {
        class: "vxe-input--date-" + datePanelType + "-view",
        cellspacing: 0,
        cellpadding: 0,
        border: 0
      }, [(0, _vue.h)('thead', [(0, _vue.h)('tr', weekHeaders.map(function (item) {
        return (0, _vue.h)('th', item.label);
      }))]), (0, _vue.h)('tbody', weekDates.map(function (rows) {
        var isSelected = rows.some(function (item) {
          return _xeUtils.default.isDateSame(dateValue, item.date, matchFormat);
        });
        var isHover = rows.some(function (item) {
          return _xeUtils.default.isDateSame(datePanelValue, item.date, matchFormat);
        });
        return (0, _vue.h)('tr', rows.map(function (item) {
          return (0, _vue.h)('td', {
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
            onClick: function onClick() {
              return dateSelectEvent(item);
            },
            onMouseenter: function onMouseenter() {
              return dateMouseenterEvent(item);
            }
          }, renderDateLabel(item, item.label));
        }));
      }))])];
    };

    var renderDateMonthTable = function renderDateMonthTable() {
      var datePanelType = reactData.datePanelType,
          datePanelValue = reactData.datePanelValue;
      var dateValue = computeDateValue.value;
      var monthDatas = computeMonthDatas.value;
      var matchFormat = 'yyyyMM';
      return [(0, _vue.h)('table', {
        class: "vxe-input--date-" + datePanelType + "-view",
        cellspacing: 0,
        cellpadding: 0,
        border: 0
      }, [(0, _vue.h)('tbody', monthDatas.map(function (rows) {
        return (0, _vue.h)('tr', rows.map(function (item) {
          return (0, _vue.h)('td', {
            class: {
              'is--prev': item.isPrev,
              'is--current': item.isCurrent,
              'is--now': item.isNow,
              'is--next': item.isNext,
              'is--disabled': isDateDisabled(item),
              'is--selected': _xeUtils.default.isDateSame(dateValue, item.date, matchFormat),
              'is--hover': _xeUtils.default.isDateSame(datePanelValue, item.date, matchFormat)
            },
            onClick: function onClick() {
              return dateSelectEvent(item);
            },
            onMouseenter: function onMouseenter() {
              return dateMouseenterEvent(item);
            }
          }, renderDateLabel(item, _conf.default.i18n("vxe.input.date.months.m" + item.month)));
        }));
      }))])];
    };

    var renderDateQuarterTable = function renderDateQuarterTable() {
      var datePanelType = reactData.datePanelType,
          datePanelValue = reactData.datePanelValue;
      var dateValue = computeDateValue.value;
      var quarterDatas = computeQuarterDatas.value;
      var matchFormat = 'yyyyq';
      return [(0, _vue.h)('table', {
        class: "vxe-input--date-" + datePanelType + "-view",
        cellspacing: 0,
        cellpadding: 0,
        border: 0
      }, [(0, _vue.h)('tbody', quarterDatas.map(function (rows) {
        return (0, _vue.h)('tr', rows.map(function (item) {
          return (0, _vue.h)('td', {
            class: {
              'is--prev': item.isPrev,
              'is--current': item.isCurrent,
              'is--now': item.isNow,
              'is--next': item.isNext,
              'is--disabled': isDateDisabled(item),
              'is--selected': _xeUtils.default.isDateSame(dateValue, item.date, matchFormat),
              'is--hover': _xeUtils.default.isDateSame(datePanelValue, item.date, matchFormat)
            },
            onClick: function onClick() {
              return dateSelectEvent(item);
            },
            onMouseenter: function onMouseenter() {
              return dateMouseenterEvent(item);
            }
          }, renderDateLabel(item, _conf.default.i18n("vxe.input.date.quarters.q" + item.quarter)));
        }));
      }))])];
    };

    var renderDateYearTable = function renderDateYearTable() {
      var datePanelType = reactData.datePanelType,
          datePanelValue = reactData.datePanelValue;
      var dateValue = computeDateValue.value;
      var yearDatas = computeYearDatas.value;
      var matchFormat = 'yyyy';
      return [(0, _vue.h)('table', {
        class: "vxe-input--date-" + datePanelType + "-view",
        cellspacing: 0,
        cellpadding: 0,
        border: 0
      }, [(0, _vue.h)('tbody', yearDatas.map(function (rows) {
        return (0, _vue.h)('tr', rows.map(function (item) {
          return (0, _vue.h)('td', {
            class: {
              'is--disabled': isDateDisabled(item),
              'is--current': item.isCurrent,
              'is--now': item.isNow,
              'is--selected': _xeUtils.default.isDateSame(dateValue, item.date, matchFormat),
              'is--hover': _xeUtils.default.isDateSame(datePanelValue, item.date, matchFormat)
            },
            onClick: function onClick() {
              return dateSelectEvent(item);
            },
            onMouseenter: function onMouseenter() {
              return dateMouseenterEvent(item);
            }
          }, renderDateLabel(item, item.year));
        }));
      }))])];
    };

    var renderDateTable = function renderDateTable() {
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

    var renderDatePanel = function renderDatePanel() {
      var datePanelType = reactData.datePanelType;
      var isDisabledPrevDateBtn = computeIsDisabledPrevDateBtn.value;
      var isDisabledNextDateBtn = computeIsDisabledNextDateBtn.value;
      var selectDatePanelLabel = computeSelectDatePanelLabel.value;
      return [(0, _vue.h)('div', {
        class: 'vxe-input--date-picker-header'
      }, [(0, _vue.h)('div', {
        class: 'vxe-input--date-picker-type-wrapper'
      }, [datePanelType === 'year' ? (0, _vue.h)('span', {
        class: 'vxe-input--date-picker-label'
      }, selectDatePanelLabel) : (0, _vue.h)('span', {
        class: 'vxe-input--date-picker-btn',
        onClick: dateToggleTypeEvent
      }, selectDatePanelLabel)]), (0, _vue.h)('div', {
        class: 'vxe-input--date-picker-btn-wrapper'
      }, [(0, _vue.h)('span', {
        class: ['vxe-input--date-picker-btn vxe-input--date-picker-prev-btn', {
          'is--disabled': isDisabledPrevDateBtn
        }],
        onClick: datePrevEvent
      }, [(0, _vue.h)('i', {
        class: 'vxe-icon--caret-left'
      })]), (0, _vue.h)('span', {
        class: 'vxe-input--date-picker-btn vxe-input--date-picker-current-btn',
        onClick: dateTodayMonthEvent
      }, [(0, _vue.h)('i', {
        class: 'vxe-icon--dot'
      })]), (0, _vue.h)('span', {
        class: ['vxe-input--date-picker-btn vxe-input--date-picker-next-btn', {
          'is--disabled': isDisabledNextDateBtn
        }],
        onClick: dateNextEvent
      }, [(0, _vue.h)('i', {
        class: 'vxe-icon--caret-right'
      })])])]), (0, _vue.h)('div', {
        class: 'vxe-input--date-picker-body'
      }, renderDateTable())];
    };

    var renderTimePanel = function renderTimePanel() {
      var datetimePanelValue = reactData.datetimePanelValue;
      var dateTimeLabel = computeDateTimeLabel.value;
      var hourList = computeHourList.value;
      var minuteList = computeMinuteList.value;
      var secondList = computeSecondList.value;
      return [(0, _vue.h)('div', {
        class: 'vxe-input--time-picker-header'
      }, [(0, _vue.h)('span', {
        class: 'vxe-input--time-picker-title'
      }, dateTimeLabel), (0, _vue.h)('button', {
        class: 'vxe-input--time-picker-confirm',
        type: 'button',
        onClick: dateConfirmEvent
      }, _conf.default.i18n('vxe.button.confirm'))]), (0, _vue.h)('div', {
        ref: refInputTimeBody,
        class: 'vxe-input--time-picker-body'
      }, [(0, _vue.h)('ul', {
        class: 'vxe-input--time-picker-hour-list'
      }, hourList.map(function (item, index) {
        return (0, _vue.h)('li', {
          key: index,
          class: {
            'is--selected': datetimePanelValue && datetimePanelValue.getHours() === item.value
          },
          onClick: function onClick(evnt) {
            return dateHourEvent(evnt, item);
          }
        }, item.label);
      })), (0, _vue.h)('ul', {
        class: 'vxe-input--time-picker-minute-list'
      }, minuteList.map(function (item, index) {
        return (0, _vue.h)('li', {
          key: index,
          class: {
            'is--selected': datetimePanelValue && datetimePanelValue.getMinutes() === item.value
          },
          onClick: function onClick(evnt) {
            return dateMinuteEvent(evnt, item);
          }
        }, item.label);
      })), (0, _vue.h)('ul', {
        class: 'vxe-input--time-picker-second-list'
      }, secondList.map(function (item, index) {
        return (0, _vue.h)('li', {
          key: index,
          class: {
            'is--selected': datetimePanelValue && datetimePanelValue.getSeconds() === item.value
          },
          onClick: function onClick(evnt) {
            return dateSecondEvent(evnt, item);
          }
        }, item.label);
      }))])];
    };

    var renderPanel = function renderPanel() {
      var _a;

      var type = props.type,
          transfer = props.transfer;
      var inited = reactData.inited,
          animatVisible = reactData.animatVisible,
          visiblePanel = reactData.visiblePanel,
          panelPlacement = reactData.panelPlacement,
          panelStyle = reactData.panelStyle;
      var vSize = computeSize.value;
      var isDatePickerType = computeIsDatePickerType.value;
      var renders = [];

      if (isDatePickerType) {
        if (type === 'datetime') {
          renders.push((0, _vue.h)('div', {
            class: 'vxe-input--panel-layout-wrapper'
          }, [(0, _vue.h)('div', {
            class: 'vxe-input--panel-left-wrapper'
          }, renderDatePanel()), (0, _vue.h)('div', {
            class: 'vxe-input--panel-right-wrapper'
          }, renderTimePanel())]));
        } else if (type === 'time') {
          renders.push((0, _vue.h)('div', {
            class: 'vxe-input--panel-wrapper'
          }, renderTimePanel()));
        } else {
          renders.push((0, _vue.h)('div', {
            class: 'vxe-input--panel-wrapper'
          }, renderDatePanel()));
        }

        return (0, _vue.h)(_vue.Teleport, {
          to: 'body',
          disabled: transfer ? !inited : true
        }, [(0, _vue.h)('div', {
          ref: refInputPanel,
          class: ['vxe-table--ignore-clear vxe-input--panel', "type--" + type, (_a = {}, _a["size--" + vSize] = vSize, _a['is--transfer'] = transfer, _a['animat--leave'] = animatVisible, _a['animat--enter'] = visiblePanel, _a)],
          placement: panelPlacement,
          style: panelStyle
        }, renders)]);
      }

      return null;
    };

    var renderNumberIcon = function renderNumberIcon() {
      return (0, _vue.h)('span', {
        class: 'vxe-input--number-suffix'
      }, [(0, _vue.h)('span', {
        class: 'vxe-input--number-prev is--prev',
        onMousedown: numberMousedownEvent,
        onMouseup: numberStopDown,
        onMouseleave: numberStopDown
      }, [(0, _vue.h)('i', {
        class: ['vxe-input--number-prev-icon', _conf.default.icon.INPUT_PREV_NUM]
      })]), (0, _vue.h)('span', {
        class: 'vxe-input--number-next is--next',
        onMousedown: numberMousedownEvent,
        onMouseup: numberStopDown,
        onMouseleave: numberStopDown
      }, [(0, _vue.h)('i', {
        class: ['vxe-input--number-next-icon', _conf.default.icon.INPUT_NEXT_NUM]
      })])]);
    };

    var renderDatePickerIcon = function renderDatePickerIcon() {
      return (0, _vue.h)('span', {
        class: 'vxe-input--date-picker-suffix',
        onClick: datePickerOpenEvent
      }, [(0, _vue.h)('i', {
        class: ['vxe-input--date-picker-icon', _conf.default.icon.INPUT_DATE]
      })]);
    };

    var renderSearchIcon = function renderSearchIcon() {
      return (0, _vue.h)('span', {
        class: 'vxe-input--search-suffix',
        onClick: searchEvent
      }, [(0, _vue.h)('i', {
        class: ['vxe-input--search-icon', _conf.default.icon.INPUT_SEARCH]
      })]);
    };

    var renderPasswordIcon = function renderPasswordIcon() {
      var showPwd = reactData.showPwd;
      return (0, _vue.h)('span', {
        class: 'vxe-input--password-suffix',
        onClick: passwordToggleEvent
      }, [(0, _vue.h)('i', {
        class: ['vxe-input--password-icon', showPwd ? _conf.default.icon.INPUT_SHOW_PWD : _conf.default.icon.INPUT_PWD]
      })]);
    };

    var rendePrefixIcon = function rendePrefixIcon() {
      var prefixIcon = props.prefixIcon;
      var prefixSlot = slots.prefix;
      var icons = [];

      if (prefixSlot) {
        icons.push((0, _vue.h)('span', {
          class: 'vxe-input--prefix-icon'
        }, prefixSlot({})));
      } else if (prefixIcon) {
        icons.push((0, _vue.h)('i', {
          class: ['vxe-input--prefix-icon', prefixIcon]
        }));
      }

      return icons.length ? (0, _vue.h)('span', {
        class: 'vxe-input--prefix',
        onClick: clickPrefixEvent
      }, icons) : null;
    };

    var renderSuffixIcon = function renderSuffixIcon() {
      var disabled = props.disabled,
          suffixIcon = props.suffixIcon;
      var inputValue = reactData.inputValue;
      var suffixSlot = slots.suffix;
      var isClearable = computeIsClearable.value;
      var icons = [];

      if (suffixSlot) {
        icons.push((0, _vue.h)('span', {
          class: 'vxe-input--suffix-icon'
        }, suffixSlot({})));
      } else if (suffixIcon) {
        icons.push((0, _vue.h)('i', {
          class: ['vxe-input--suffix-icon', suffixIcon]
        }));
      }

      if (isClearable) {
        icons.push((0, _vue.h)('i', {
          class: ['vxe-input--clear-icon', _conf.default.icon.INPUT_CLEAR]
        }));
      }

      return icons.length ? (0, _vue.h)('span', {
        class: ['vxe-input--suffix', {
          'is--clear': isClearable && !disabled && !(inputValue === '' || _xeUtils.default.eqNull(inputValue))
        }],
        onClick: clickSuffixEvent
      }, icons) : null;
    };

    var renderExtraSuffixIcon = function renderExtraSuffixIcon() {
      var controls = props.controls;
      var isNumType = computeIsNumType.value;
      var isDatePickerType = computeIsDatePickerType.value;
      var isPawdType = computeIsPawdType.value;
      var isSearchType = computeIsSearchType.value;
      var icons;

      if (isPawdType) {
        icons = renderPasswordIcon();
      } else if (isNumType) {
        if (controls) {
          icons = renderNumberIcon();
        }
      } else if (isDatePickerType) {
        icons = renderDatePickerIcon();
      } else if (isSearchType) {
        icons = renderSearchIcon();
      }

      return icons ? (0, _vue.h)('span', {
        class: 'vxe-input--extra-suffix'
      }, [icons]) : null;
    };

    inputMethods = {
      dispatchEvent: function dispatchEvent(type, params, evnt) {
        emit(type, Object.assign({
          $input: $xeinput,
          $event: evnt
        }, params));
      },
      focus: function focus() {
        var inputElem = refInputTarget.value;
        reactData.isActivated = true;
        inputElem.focus();
        return (0, _vue.nextTick)();
      },
      blur: function blur() {
        var inputElem = refInputTarget.value;
        inputElem.blur();
        reactData.isActivated = false;
        return (0, _vue.nextTick)();
      }
    };
    Object.assign($xeinput, inputMethods);
    (0, _vue.watch)(function () {
      return props.modelValue;
    }, function (val) {
      reactData.inputValue = val;
      changeValue();
    });
    (0, _vue.watch)(computeDateLabelFormat, function () {
      dateParseValue(reactData.datePanelValue);
      reactData.inputValue = reactData.datePanelLabel;
    });
    (0, _vue.nextTick)(function () {
      _event.GlobalEvent.on($xeinput, 'mousewheel', handleGlobalMousewheelEvent);

      _event.GlobalEvent.on($xeinput, 'mousedown', handleGlobalMousedownEvent);

      _event.GlobalEvent.on($xeinput, 'keydown', handleGlobalKeydownEvent);

      _event.GlobalEvent.on($xeinput, 'blur', handleGlobalBlurEvent);
    });
    (0, _vue.onUnmounted)(function () {
      numberStopDown();

      _event.GlobalEvent.off($xeinput, 'mousewheel');

      _event.GlobalEvent.off($xeinput, 'mousedown');

      _event.GlobalEvent.off($xeinput, 'keydown');

      _event.GlobalEvent.off($xeinput, 'blur');
    });
    initValue();

    var renderVN = function renderVN() {
      var _a;

      var className = props.className,
          controls = props.controls,
          type = props.type,
          align = props.align,
          name = props.name,
          disabled = props.disabled,
          readonly = props.readonly,
          autocomplete = props.autocomplete;
      var inputValue = reactData.inputValue,
          visiblePanel = reactData.visiblePanel,
          isActivated = reactData.isActivated;
      var vSize = computeSize.value;
      var isDatePickerType = computeIsDatePickerType.value;
      var inpReadonly = computeInpReadonly.value;
      var inpMaxlength = computeInpMaxlength.value;
      var inputType = computeInputType.value;
      var inpPlaceholder = computeInpPlaceholder.value;
      var childs = [];
      var prefix = rendePrefixIcon();
      var suffix = renderSuffixIcon(); // ????????????

      if (prefix) {
        childs.push(prefix);
      } // ?????????


      childs.push((0, _vue.h)('input', {
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
      })); // ????????????

      if (suffix) {
        childs.push(suffix);
      } // ??????????????????


      childs.push(renderExtraSuffixIcon()); // ????????????

      if (isDatePickerType) {
        childs.push(renderPanel());
      }

      return (0, _vue.h)('div', {
        ref: refElem,
        class: ['vxe-input', "type--" + type, className, (_a = {}, _a["size--" + vSize] = vSize, _a["is--" + align] = align, _a['is--controls'] = controls, _a['is--prefix'] = !!prefix, _a['is--suffix'] = !!suffix, _a['is--readonly'] = readonly, _a['is--visivle'] = visiblePanel, _a['is--disabled'] = disabled, _a['is--active'] = isActivated, _a)]
      }, childs);
    };

    $xeinput.renderVN = renderVN;
    return $xeinput;
  },
  render: function render() {
    return this.renderVN();
  }
});

exports.default = _default2;