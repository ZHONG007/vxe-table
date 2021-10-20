import GlobalConfig from '../../v-x-e-table/src/conf';
export default {
    /** 基本属性 */
    id: String,
    // 数据
    data: Array,
    // 表格的高度
    height: [Number, String],
    // 表格的最大高度
    maxHeight: [Number, String],
    // 所有列是否允许拖动列宽调整大小
    resizable: { type: Boolean, default: function () { return GlobalConfig.table.resizable; } },
    // 是否带有斑马纹
    stripe: { type: Boolean, default: function () { return GlobalConfig.table.stripe; } },
    // 是否带有边框
    border: { type: [Boolean, String], default: function () { return GlobalConfig.table.border; } },
    // 是否圆角边框
    round: { type: Boolean, default: function () { return GlobalConfig.table.round; } },
    // 表格的尺寸
    size: { type: String, default: function () { return GlobalConfig.table.size || GlobalConfig.size; } },
    // 列的宽度是否自撑开（可能会被废弃的参数，不要使用）
    fit: { type: Boolean, default: function () { return GlobalConfig.table.fit; } },
    // 表格是否加载中
    loading: Boolean,
    // 所有的列对其方式
    align: { type: String, default: function () { return GlobalConfig.table.align; } },
    // 所有的表头列的对齐方式
    headerAlign: { type: String, default: function () { return GlobalConfig.table.headerAlign; } },
    // 所有的表尾列的对齐方式
    footerAlign: { type: String, default: function () { return GlobalConfig.table.footerAlign; } },
    // 是否显示表头
    showHeader: { type: Boolean, default: function () { return GlobalConfig.table.showHeader; } },
    // 是否要高亮当前选中行
    highlightCurrentRow: { type: Boolean, default: function () { return GlobalConfig.table.highlightCurrentRow; } },
    // 鼠标移到行是否要高亮显示
    highlightHoverRow: { type: Boolean, default: function () { return GlobalConfig.table.highlightHoverRow; } },
    // 是否要高亮当前选中列
    highlightCurrentColumn: { type: Boolean, default: function () { return GlobalConfig.table.highlightCurrentColumn; } },
    // 鼠标移到列是否要高亮显示
    highlightHoverColumn: { type: Boolean, default: function () { return GlobalConfig.table.highlightHoverColumn; } },
    // 激活单元格编辑时是否高亮显示
    highlightCell: Boolean,
    // 是否显示表尾合计
    showFooter: Boolean,
    // 表尾合计的计算方法
    footerMethod: Function,
    // 给行附加 className
    rowClassName: [String, Function],
    // 给单元格附加 className
    cellClassName: [String, Function],
    // 给表头的行附加 className
    headerRowClassName: [String, Function],
    // 给表头的单元格附加 className
    headerCellClassName: [String, Function],
    // 给表尾的行附加 className
    footerRowClassName: [String, Function],
    // 给表尾的单元格附加 className
    footerCellClassName: [String, Function],
    // 给单元格附加样式
    cellStyle: [Object, Function],
    // 给表头单元格附加样式
    headerCellStyle: [Object, Function],
    // 给表尾单元格附加样式
    footerCellStyle: [Object, Function],
    // 给行附加样式
    rowStyle: [Object, Function],
    // 给表头行附加样式
    headerRowStyle: [Object, Function],
    // 给表尾行附加样式
    footerRowStyle: [Object, Function],
    // 合并指定单元格
    mergeCells: Array,
    // 合并指定的表尾
    mergeFooterItems: Array,
    // 自定义合并行或列的方法
    spanMethod: Function,
    // 表尾合并行或列
    footerSpanMethod: Function,
    // 设置所有内容过长时显示为省略号
    showOverflow: { type: [Boolean, String], default: function () { return GlobalConfig.table.showOverflow; } },
    // 设置表头所有内容过长时显示为省略号
    showHeaderOverflow: { type: [Boolean, String], default: function () { return GlobalConfig.table.showHeaderOverflow; } },
    // 设置表尾所有内容过长时显示为省略号
    showFooterOverflow: { type: [Boolean, String], default: function () { return GlobalConfig.table.showFooterOverflow; } },
    /** 高级属性 */
    // 主键配置
    columnKey: Boolean,
    rowKey: Boolean,
    rowId: { type: String, default: function () { return GlobalConfig.table.rowId; } },
    zIndex: Number,
    emptyText: { type: String, default: function () { return GlobalConfig.table.emptyText; } },
    keepSource: { type: Boolean, default: function () { return GlobalConfig.table.keepSource; } },
    // 是否自动监听父容器变化去更新响应式表格宽高
    autoResize: { type: Boolean, default: function () { return GlobalConfig.table.autoResize; } },
    // 是否自动根据状态属性去更新响应式表格宽高
    syncResize: [Boolean, String, Number],
    // 设置列的默认参数，仅对部分支持的属性有效
    columnConfig: Object,
    resizableConfig: Object,
    // 序号配置项
    seqConfig: Object,
    // 排序配置项
    sortConfig: Object,
    // 筛选配置项
    filterConfig: Object,
    // 单选框配置
    radioConfig: Object,
    // 复选框配置项
    checkboxConfig: Object,
    // tooltip 配置项
    tooltipConfig: Object,
    // 导出配置项
    exportConfig: Object,
    // 导入配置项
    importConfig: Object,
    // 打印配置项
    printConfig: Object,
    // 展开行配置项
    expandConfig: Object,
    // 树形结构配置项
    treeConfig: Object,
    // 快捷菜单配置项
    menuConfig: Object,
    // 鼠标配置项
    mouseConfig: Object,
    // 区域配置项
    areaConfig: Object,
    // 按键配置项
    keyboardConfig: Object,
    // 复制粘/贴配置项
    clipConfig: Object,
    // 查找/替换配置项
    fnrConfig: Object,
    // 编辑配置项
    editConfig: Object,
    // 校验配置项
    validConfig: Object,
    // 校验规则配置项
    editRules: Object,
    // 空内容渲染配置项
    emptyRender: Object,
    // 自定义列配置项
    customConfig: Object,
    // 横向虚拟滚动配置项
    scrollX: Object,
    // 纵向虚拟滚动配置项
    scrollY: Object,
    // 优化相关
    animat: { type: Boolean, default: function () { return GlobalConfig.table.animat; } },
    delayHover: { type: Number, default: function () { return GlobalConfig.table.delayHover; } },
    // 额外的参数
    params: Object
};
