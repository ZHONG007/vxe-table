"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _vue = require("vue");

var _column = require("./column");

var _util = require("../../table/src/util");

var _cell = _interopRequireDefault(require("../../table/src/cell"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (0, _vue.defineComponent)({
  name: 'VxeColgroup',
  props: _column.columnProps,
  setup: function setup(props, _a) {
    var slots = _a.slots;
    var refElem = (0, _vue.ref)();
    var $xetable = (0, _vue.inject)('$xetable', {});
    var colgroup = (0, _vue.inject)('xecolgroup', null);

    var column = _cell.default.createColumn($xetable, props);

    var columnSlots = {};

    if (slots.header) {
      columnSlots.header = slots.header;
    }

    var xecolumn = {
      column: column
    };
    column.slots = columnSlots;
    column.children = [];
    (0, _vue.provide)('xecolgroup', xecolumn);
    (0, _vue.provide)('$xegrid', null);
    (0, _util.watchColumn)(props, column);
    (0, _vue.onMounted)(function () {
      (0, _util.assemColumn)($xetable, refElem.value, column, colgroup);
    });
    (0, _vue.onUnmounted)(function () {
      (0, _util.destroyColumn)($xetable, column);
    });

    var renderVN = function renderVN() {
      return (0, _vue.h)('div', {
        ref: refElem
      }, slots.default ? slots.default() : []);
    };

    return renderVN;
  }
});

exports.default = _default;