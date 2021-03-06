"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.columnProps = void 0;

var _vue = require("vue");

var _util = require("../../table/src/util");

var _cell = _interopRequireDefault(require("../../table/src/cell"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var columnProps = {
  // 列唯一主键
  colId: [String, Number],
  // 渲染类型 index,radio,checkbox,expand,html
  type: String,
  // 列字段名
  field: String,
  // 列标题
  title: String,
  // 列宽度
  width: [Number, String],
  // 列最小宽度，把剩余宽度按比例分配
  minWidth: [Number, String],
  // 是否允许拖动列宽调整大小
  resizable: {
    type: Boolean,
    default: null
  },
  // 将列固定在左侧或者右侧
  fixed: String,
  // 列对其方式
  align: String,
  // 表头对齐方式
  headerAlign: String,
  // 表尾列的对齐方式
  footerAlign: String,
  // 当内容过长时显示为省略号
  showOverflow: {
    type: [Boolean, String],
    default: null
  },
  // 当表头内容过长时显示为省略号
  showHeaderOverflow: {
    type: [Boolean, String],
    default: null
  },
  // 当表尾内容过长时显示为省略号
  showFooterOverflow: {
    type: [Boolean, String],
    default: null
  },
  // 给单元格附加 className
  className: [String, Function],
  // 给表头单元格附加 className
  headerClassName: [String, Function],
  // 给表尾单元格附加 className
  footerClassName: [String, Function],
  // 格式化显示内容
  formatter: [Function, Array, String],
  // 是否允许排序
  sortable: Boolean,
  // 自定义排序的属性
  sortBy: [String, Function],
  // 排序的字段类型，比如字符串转数值等
  sortType: String,
  // 配置筛选条件数组
  filters: {
    type: Array,
    default: null
  },
  // 筛选是否允许多选
  filterMultiple: {
    type: Boolean,
    default: true
  },
  // 自定义筛选方法
  filterMethod: Function,
  // 筛选重置方法
  filterResetMethod: Function,
  // 筛选复原方法
  filterRecoverMethod: Function,
  // 筛选模板配置项
  filterRender: Object,
  // 指定为树节点
  treeNode: Boolean,
  // 是否可视
  visible: {
    type: Boolean,
    default: null
  },
  // 单元格数据导出方法
  exportMethod: Function,
  // 表尾单元格数据导出方法
  footerExportMethod: Function,
  // 标题帮助图标配置项
  titleHelp: Object,
  // 单元格值类型
  cellType: String,
  // 单元格渲染配置项
  cellRender: Object,
  // 单元格编辑渲染配置项
  editRender: Object,
  // 内容渲染配置项
  contentRender: Object,
  // 额外的参数
  params: Object
};
exports.columnProps = columnProps;

var _default = (0, _vue.defineComponent)({
  name: 'VxeColumn',
  props: columnProps,
  setup: function setup(props, _a) {
    var slots = _a.slots;
    var refElem = (0, _vue.ref)();
    var $xetable = (0, _vue.inject)('$xetable', {});
    var colgroup = (0, _vue.inject)('xecolgroup', null);

    var column = _cell.default.createColumn($xetable, props);

    column.slots = slots;
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
      });
    };

    return renderVN;
  }
});

exports.default = _default;