var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { h } from 'vue';
import XEUtils from 'xe-utils';
import GlobalConfig from '../../v-x-e-table/src/conf';
import { VXETable } from '../../v-x-e-table';
import { getFuncText, isEnableConf, formatText, eqEmptyValue } from '../../tools/utils';
import { updateCellTitle } from '../../tools/dom';
import { createColumn } from './util';
function renderHelpIcon(params) {
    var $table = params.$table, column = params.column;
    var titleHelp = column.titleHelp;
    return titleHelp ? [
        h('i', {
            class: ['vxe-cell-help-icon', titleHelp.icon || GlobalConfig.icon.TABLE_HELP],
            onMouseenter: function (evnt) {
                $table.triggerHeaderHelpEvent(evnt, params);
            },
            onMouseleave: function (evnt) {
                $table.handleTargetLeaveEvent(evnt);
            }
        })
    ] : [];
}
function renderTitleContent(params, content) {
    var $table = params.$table, column = params.column;
    var props = $table.props, internalData = $table.internalData;
    var computeTooltipOpts = $table.getComputeMaps().computeTooltipOpts;
    var allColumnHeaderOverflow = props.showHeaderOverflow;
    var type = column.type, showHeaderOverflow = column.showHeaderOverflow;
    var tooltipOpts = computeTooltipOpts.value;
    var showAllTip = tooltipOpts.showAll;
    var headOverflow = XEUtils.isUndefined(showHeaderOverflow) || XEUtils.isNull(showHeaderOverflow) ? allColumnHeaderOverflow : showHeaderOverflow;
    var showTitle = headOverflow === 'title';
    var showTooltip = headOverflow === true || headOverflow === 'tooltip';
    var ons = {};
    if (showTitle || showTooltip || showAllTip) {
        ons.onMouseenter = function (evnt) {
            if (internalData._isResize) {
                return;
            }
            if (showTitle) {
                updateCellTitle(evnt.currentTarget, column);
            }
            else if (showTooltip || showAllTip) {
                $table.triggerHeaderTooltipEvent(evnt, params);
            }
        };
    }
    if (showTooltip || showAllTip) {
        ons.onMouseleave = function (evnt) {
            if (internalData._isResize) {
                return;
            }
            if (showTooltip || showAllTip) {
                $table.handleTargetLeaveEvent(evnt);
            }
        };
    }
    return [
        type === 'html' && XEUtils.isString(content) ? h('span', __assign({ class: 'vxe-cell--title', innerHTML: content }, ons)) : h('span', __assign({ class: 'vxe-cell--title' }, ons), content)
    ];
}
function getFooterContent(params) {
    var $table = params.$table, column = params.column, _columnIndex = params._columnIndex, items = params.items;
    var slots = column.slots, editRender = column.editRender, cellRender = column.cellRender;
    var renderOpts = editRender || cellRender;
    var footerSlot = slots ? slots.footer : null;
    if (footerSlot) {
        return $table.callSlot(footerSlot, params);
    }
    if (renderOpts) {
        var compConf = VXETable.renderer.get(renderOpts.name);
        if (compConf && compConf.renderFooter) {
            return compConf.renderFooter(renderOpts, params);
        }
    }
    return [formatText(items[_columnIndex], 1)];
}
function getDefaultCellLabel(params) {
    var $table = params.$table, row = params.row, column = params.column;
    return formatText($table.getCellLabel(row, column), 1);
}
export var Cell = {
    createColumn: function ($xetable, columnOpts) {
        var type = columnOpts.type, sortable = columnOpts.sortable, filters = columnOpts.filters, editRender = columnOpts.editRender, treeNode = columnOpts.treeNode;
        var props = $xetable.props;
        var editConfig = props.editConfig;
        var _a = $xetable.getComputeMaps(), computeEditOpts = _a.computeEditOpts, computeCheckboxOpts = _a.computeCheckboxOpts;
        var checkboxOpts = computeCheckboxOpts.value;
        var editOpts = computeEditOpts.value;
        var renConfs = {
            renderHeader: Cell.renderDefaultHeader,
            renderCell: treeNode ? Cell.renderTreeCell : Cell.renderDefaultCell,
            renderFooter: Cell.renderDefaultFooter
        };
        switch (type) {
            case 'seq':
                renConfs.renderHeader = Cell.renderIndexHeader;
                renConfs.renderCell = treeNode ? Cell.renderTreeIndexCell : Cell.renderIndexCell;
                break;
            case 'radio':
                renConfs.renderHeader = Cell.renderRadioHeader;
                renConfs.renderCell = treeNode ? Cell.renderTreeRadioCell : Cell.renderRadioCell;
                break;
            case 'checkbox':
                renConfs.renderHeader = Cell.renderSelectionHeader;
                renConfs.renderCell = checkboxOpts.checkField ? (treeNode ? Cell.renderTreeSelectionCellByProp : Cell.renderSelectionCellByProp) : (treeNode ? Cell.renderTreeSelectionCell : Cell.renderSelectionCell);
                break;
            case 'expand':
                renConfs.renderCell = Cell.renderExpandCell;
                renConfs.renderData = Cell.renderExpandData;
                break;
            case 'html':
                renConfs.renderCell = treeNode ? Cell.renderTreeHTMLCell : Cell.renderHTMLCell;
                if (filters && sortable) {
                    renConfs.renderHeader = Cell.renderSortAndFilterHeader;
                }
                else if (sortable) {
                    renConfs.renderHeader = Cell.renderSortHeader;
                }
                else if (filters) {
                    renConfs.renderHeader = Cell.renderFilterHeader;
                }
                break;
            default:
                if (editConfig && editRender) {
                    renConfs.renderHeader = Cell.renderEditHeader;
                    renConfs.renderCell = editOpts.mode === 'cell' ? (treeNode ? Cell.renderTreeCellEdit : Cell.renderCellEdit) : (treeNode ? Cell.renderTreeRowEdit : Cell.renderRowEdit);
                }
                else if (filters && sortable) {
                    renConfs.renderHeader = Cell.renderSortAndFilterHeader;
                }
                else if (sortable) {
                    renConfs.renderHeader = Cell.renderSortHeader;
                }
                else if (filters) {
                    renConfs.renderHeader = Cell.renderFilterHeader;
                }
        }
        return createColumn($xetable, columnOpts, renConfs);
    },
    /**
     * ?????????
     */
    renderHeaderTitle: function (params) {
        var $table = params.$table, column = params.column;
        var slots = column.slots, editRender = column.editRender, cellRender = column.cellRender;
        var renderOpts = editRender || cellRender;
        var headerSlot = slots ? slots.header : null;
        if (headerSlot) {
            return renderTitleContent(params, $table.callSlot(headerSlot, params));
        }
        if (renderOpts) {
            var compConf = VXETable.renderer.get(renderOpts.name);
            if (compConf && compConf.renderHeader) {
                return renderTitleContent(params, compConf.renderHeader(renderOpts, params));
            }
        }
        return renderTitleContent(params, formatText(column.getTitle(), 1));
    },
    renderDefaultHeader: function (params) {
        return renderHelpIcon(params).concat(Cell.renderHeaderTitle(params));
    },
    renderDefaultCell: function (params) {
        var $table = params.$table, row = params.row, column = params.column;
        var slots = column.slots, editRender = column.editRender, cellRender = column.cellRender;
        var renderOpts = editRender || cellRender;
        var defaultSlot = slots ? slots.default : null;
        if (defaultSlot) {
            return $table.callSlot(defaultSlot, params);
        }
        if (renderOpts) {
            var funName = editRender ? 'renderCell' : 'renderDefault';
            var compConf = VXETable.renderer.get(renderOpts.name);
            var compFn = compConf ? compConf[funName] : null;
            if (compFn) {
                return compFn(renderOpts, Object.assign({ $type: editRender ? 'edit' : 'cell' }, params));
            }
        }
        var cellValue = $table.getCellLabel(row, column);
        var cellPlaceholder = editRender ? editRender.placeholder : '';
        return [
            h('span', {
                class: 'vxe-cell--label'
            }, editRender && eqEmptyValue(cellValue) ? [
                // ?????????????????????
                h('span', {
                    class: 'vxe-cell--placeholder'
                }, formatText(getFuncText(cellPlaceholder), 1))
            ] : formatText(cellValue, 1))
        ];
    },
    renderTreeCell: function (params) {
        return Cell.renderTreeIcon(params, Cell.renderDefaultCell(params));
    },
    renderDefaultFooter: function (params) {
        return [
            h('span', {
                class: 'vxe-cell--item'
            }, getFooterContent(params))
        ];
    },
    /**
     * ?????????
     */
    renderTreeIcon: function (params, cellVNodes) {
        var $table = params.$table, isHidden = params.isHidden;
        var reactData = $table.reactData;
        var computeTreeOpts = $table.getComputeMaps().computeTreeOpts;
        var treeExpandeds = reactData.treeExpandeds, treeLazyLoadeds = reactData.treeLazyLoadeds;
        var treeOpts = computeTreeOpts.value;
        var row = params.row, column = params.column, level = params.level;
        var slots = column.slots;
        var children = treeOpts.children, hasChild = treeOpts.hasChild, indent = treeOpts.indent, lazy = treeOpts.lazy, trigger = treeOpts.trigger, iconLoaded = treeOpts.iconLoaded, showIcon = treeOpts.showIcon, iconOpen = treeOpts.iconOpen, iconClose = treeOpts.iconClose;
        var rowChilds = row[children];
        var iconSlot = slots ? slots.icon : null;
        var hasLazyChilds = false;
        var isAceived = false;
        var isLazyLoaded = false;
        var ons = {};
        if (iconSlot) {
            return $table.callSlot(iconSlot, params);
        }
        if (!isHidden) {
            isAceived = $table.findRowIndexOf(treeExpandeds, row) > -1;
            if (lazy) {
                isLazyLoaded = $table.findRowIndexOf(treeLazyLoadeds, row) > -1;
                hasLazyChilds = row[hasChild];
            }
        }
        if (!trigger || trigger === 'default') {
            ons.onClick = function (evnt) { return $table.triggerTreeExpandEvent(evnt, params); };
        }
        return [
            h('div', {
                class: ['vxe-cell--tree-node', {
                        'is--active': isAceived
                    }],
                style: {
                    paddingLeft: level * indent + "px"
                }
            }, [
                showIcon && ((rowChilds && rowChilds.length) || hasLazyChilds) ? [
                    h('div', __assign({ class: 'vxe-tree--btn-wrapper' }, ons), [
                        h('i', {
                            class: ['vxe-tree--node-btn', isLazyLoaded ? (iconLoaded || GlobalConfig.icon.TABLE_TREE_LOADED) : (isAceived ? (iconOpen || GlobalConfig.icon.TABLE_TREE_OPEN) : (iconClose || GlobalConfig.icon.TABLE_TREE_CLOSE))]
                        })
                    ])
                ] : null,
                h('div', {
                    class: 'vxe-tree-cell'
                }, cellVNodes)
            ])
        ];
    },
    /**
     * ??????
     */
    renderIndexHeader: function (params) {
        var $table = params.$table, column = params.column;
        var slots = column.slots;
        var headerSlot = slots ? slots.header : null;
        return renderTitleContent(params, headerSlot ? $table.callSlot(headerSlot, params) : formatText(column.getTitle(), 1));
    },
    renderIndexCell: function (params) {
        var $table = params.$table, column = params.column;
        var computeSeqOpts = $table.getComputeMaps().computeSeqOpts;
        var seqOpts = computeSeqOpts.value;
        var slots = column.slots;
        var defaultSlot = slots ? slots.default : null;
        if (defaultSlot) {
            return $table.callSlot(defaultSlot, params);
        }
        var $seq = params.$seq, seq = params.seq, level = params.level;
        var seqMethod = seqOpts.seqMethod;
        return [formatText(seqMethod ? seqMethod(params) : level ? $seq + "." + seq : (seqOpts.startIndex || 0) + seq, 1)];
    },
    renderTreeIndexCell: function (params) {
        return Cell.renderTreeIcon(params, Cell.renderIndexCell(params));
    },
    /**
     * ??????
     */
    renderRadioHeader: function (params) {
        var $table = params.$table, column = params.column;
        var slots = column.slots;
        var headerSlot = slots ? slots.header : null;
        var titleSlot = slots ? slots.title : null;
        return renderTitleContent(params, headerSlot ? $table.callSlot(headerSlot, params) : [
            h('span', {
                class: 'vxe-radio--label'
            }, titleSlot ? $table.callSlot(titleSlot, params) : formatText(column.getTitle(), 1))
        ]);
    },
    renderRadioCell: function (params) {
        var $table = params.$table, column = params.column, isHidden = params.isHidden;
        var reactData = $table.reactData;
        var computeRadioOpts = $table.getComputeMaps().computeRadioOpts;
        var selectRow = reactData.selectRow;
        var radioOpts = computeRadioOpts.value;
        var slots = column.slots;
        var labelField = radioOpts.labelField, checkMethod = radioOpts.checkMethod;
        var row = params.row;
        var defaultSlot = slots ? slots.default : null;
        var radioSlot = slots ? slots.radio : null;
        var isChecked = row === selectRow;
        var isDisabled = !!checkMethod;
        var ons;
        if (!isHidden) {
            ons = {
                onClick: function (evnt) {
                    if (!isDisabled) {
                        $table.triggerRadioRowEvent(evnt, params);
                    }
                }
            };
            if (checkMethod) {
                isDisabled = !checkMethod({ row: row });
            }
        }
        var radioParams = __assign(__assign({}, params), { checked: isChecked, disabled: isDisabled });
        return radioSlot ? $table.callSlot(radioSlot, radioParams) : [
            h('span', __assign({ class: ['vxe-cell--radio', {
                        'is--checked': isChecked,
                        'is--disabled': isDisabled
                    }] }, ons), [
                h('span', {
                    class: 'vxe-radio--icon vxe-radio--checked-icon'
                }),
                h('span', {
                    class: 'vxe-radio--icon vxe-radio--unchecked-icon'
                })
            ].concat(defaultSlot || labelField ? [
                h('span', {
                    class: 'vxe-radio--label'
                }, defaultSlot ? $table.callSlot(defaultSlot, radioParams) : XEUtils.get(row, labelField))
            ] : []))
        ];
    },
    renderTreeRadioCell: function (params) {
        return Cell.renderTreeIcon(params, Cell.renderRadioCell(params));
    },
    /**
     * ??????
     */
    renderSelectionHeader: function (params) {
        var $table = params.$table, column = params.column, isHidden = params.isHidden;
        var reactData = $table.reactData;
        var _a = $table.getComputeMaps(), computeIsAllCheckboxDisabled = _a.computeIsAllCheckboxDisabled, computeCheckboxOpts = _a.computeCheckboxOpts;
        var isAllCheckboxIndeterminate = reactData.isIndeterminate, isAllSelected = reactData.isAllSelected;
        var isAllCheckboxDisabled = computeIsAllCheckboxDisabled.value;
        var slots = column.slots;
        var headerSlot = slots ? slots.header : null;
        var titleSlot = slots ? slots.title : null;
        var checkboxOpts = computeCheckboxOpts.value;
        var headerTitle = column.getTitle();
        var isChecked = false;
        var ons;
        if (!isHidden) {
            isChecked = isAllCheckboxDisabled ? false : isAllSelected;
            ons = {
                onClick: function (evnt) {
                    if (!isAllCheckboxDisabled) {
                        $table.triggerCheckAllEvent(evnt, !isChecked);
                    }
                }
            };
        }
        var checkboxParams = __assign(__assign({}, params), { checked: isChecked, disabled: isAllCheckboxDisabled, indeterminate: isAllCheckboxIndeterminate });
        if (headerSlot) {
            return renderTitleContent(checkboxParams, $table.callSlot(headerSlot, checkboxParams));
        }
        if (checkboxOpts.checkStrictly ? !checkboxOpts.showHeader : checkboxOpts.showHeader === false) {
            return renderTitleContent(checkboxParams, [
                h('span', {
                    class: 'vxe-checkbox--label'
                }, titleSlot ? $table.callSlot(titleSlot, checkboxParams) : headerTitle)
            ]);
        }
        return renderTitleContent(checkboxParams, [
            h('span', __assign({ class: ['vxe-cell--checkbox', {
                        'is--checked': isChecked,
                        'is--disabled': isAllCheckboxDisabled,
                        'is--indeterminate': isAllCheckboxIndeterminate
                    }], title: GlobalConfig.i18n('vxe.table.allTitle') }, ons), [
                h('span', {
                    class: 'vxe-checkbox--icon vxe-checkbox--checked-icon'
                }),
                h('span', {
                    class: 'vxe-checkbox--icon vxe-checkbox--unchecked-icon'
                }),
                h('span', {
                    class: 'vxe-checkbox--icon vxe-checkbox--indeterminate-icon'
                })
            ].concat(titleSlot || headerTitle ? [
                h('span', {
                    class: 'vxe-checkbox--label'
                }, titleSlot ? $table.callSlot(titleSlot, checkboxParams) : headerTitle)
            ] : []))
        ]);
    },
    renderSelectionCell: function (params) {
        var $table = params.$table, row = params.row, column = params.column, isHidden = params.isHidden;
        var props = $table.props, reactData = $table.reactData;
        var treeConfig = props.treeConfig;
        var selection = reactData.selection, treeIndeterminates = reactData.treeIndeterminates;
        var computeCheckboxOpts = $table.getComputeMaps().computeCheckboxOpts;
        var checkboxOpts = computeCheckboxOpts.value;
        var labelField = checkboxOpts.labelField, checkMethod = checkboxOpts.checkMethod;
        var slots = column.slots;
        var defaultSlot = slots ? slots.default : null;
        var checkboxSlot = slots ? slots.checkbox : null;
        var indeterminate = false;
        var isChecked = false;
        var isDisabled = !!checkMethod;
        var ons;
        if (!isHidden) {
            isChecked = $table.findRowIndexOf(selection, row) > -1;
            ons = {
                onClick: function (evnt) {
                    if (!isDisabled) {
                        $table.triggerCheckRowEvent(evnt, params, !isChecked);
                    }
                }
            };
            if (checkMethod) {
                isDisabled = !checkMethod({ row: row });
            }
            if (treeConfig) {
                indeterminate = $table.findRowIndexOf(treeIndeterminates, row) > -1;
            }
        }
        var checkboxParams = __assign(__assign({}, params), { checked: isChecked, disabled: isDisabled, indeterminate: indeterminate });
        return checkboxSlot ? $table.callSlot(checkboxSlot, checkboxParams) : [
            h('span', __assign({ class: ['vxe-cell--checkbox', {
                        'is--checked': isChecked,
                        'is--disabled': isDisabled,
                        'is--indeterminate': indeterminate
                    }] }, ons), [
                h('span', {
                    class: 'vxe-checkbox--icon vxe-checkbox--checked-icon'
                }),
                h('span', {
                    class: 'vxe-checkbox--icon vxe-checkbox--unchecked-icon'
                }),
                h('span', {
                    class: 'vxe-checkbox--icon vxe-checkbox--indeterminate-icon'
                })
            ].concat(defaultSlot || labelField ? [
                h('span', {
                    class: 'vxe-checkbox--label'
                }, defaultSlot ? $table.callSlot(defaultSlot, checkboxParams) : XEUtils.get(row, labelField))
            ] : []))
        ];
    },
    renderTreeSelectionCell: function (params) {
        return Cell.renderTreeIcon(params, Cell.renderSelectionCell(params));
    },
    renderSelectionCellByProp: function (params) {
        var $table = params.$table, row = params.row, column = params.column, isHidden = params.isHidden;
        var props = $table.props, reactData = $table.reactData;
        var treeConfig = props.treeConfig;
        var treeIndeterminates = reactData.treeIndeterminates;
        var computeCheckboxOpts = $table.getComputeMaps().computeCheckboxOpts;
        var checkboxOpts = computeCheckboxOpts.value;
        var labelField = checkboxOpts.labelField, property = checkboxOpts.checkField, halfField = checkboxOpts.halfField, checkMethod = checkboxOpts.checkMethod;
        var slots = column.slots;
        var defaultSlot = slots ? slots.default : null;
        var checkboxSlot = slots ? slots.checkbox : null;
        var indeterminate = false;
        var isChecked = false;
        var isDisabled = !!checkMethod;
        var ons;
        if (!isHidden) {
            isChecked = XEUtils.get(row, property);
            ons = {
                onClick: function (evnt) {
                    if (!isDisabled) {
                        $table.triggerCheckRowEvent(evnt, params, !isChecked);
                    }
                }
            };
            if (checkMethod) {
                isDisabled = !checkMethod({ row: row });
            }
            if (treeConfig) {
                indeterminate = $table.findRowIndexOf(treeIndeterminates, row) > -1;
            }
        }
        var checkboxParams = __assign(__assign({}, params), { checked: isChecked, disabled: isDisabled, indeterminate: indeterminate });
        return checkboxSlot ? $table.callSlot(checkboxSlot, checkboxParams) : [
            h('span', __assign({ class: ['vxe-cell--checkbox', {
                        'is--checked': isChecked,
                        'is--disabled': isDisabled,
                        'is--indeterminate': halfField && !isChecked ? row[halfField] : indeterminate
                    }] }, ons), [
                h('span', {
                    class: 'vxe-checkbox--icon vxe-checkbox--checked-icon'
                }),
                h('span', {
                    class: 'vxe-checkbox--icon vxe-checkbox--unchecked-icon'
                }),
                h('span', {
                    class: 'vxe-checkbox--icon vxe-checkbox--indeterminate-icon'
                })
            ].concat(defaultSlot || labelField ? [
                h('span', {
                    class: 'vxe-checkbox--label'
                }, defaultSlot ? $table.callSlot(defaultSlot, checkboxParams) : XEUtils.get(row, labelField))
            ] : []))
        ];
    },
    renderTreeSelectionCellByProp: function (params) {
        return Cell.renderTreeIcon(params, Cell.renderSelectionCellByProp(params));
    },
    /**
     * ?????????
     */
    renderExpandCell: function (params) {
        var $table = params.$table, isHidden = params.isHidden, row = params.row, column = params.column;
        var reactData = $table.reactData;
        var rowExpandeds = reactData.rowExpandeds, expandLazyLoadeds = reactData.expandLazyLoadeds;
        var computeExpandOpts = $table.getComputeMaps().computeExpandOpts;
        var expandOpts = computeExpandOpts.value;
        var lazy = expandOpts.lazy, labelField = expandOpts.labelField, iconLoaded = expandOpts.iconLoaded, showIcon = expandOpts.showIcon, iconOpen = expandOpts.iconOpen, iconClose = expandOpts.iconClose, visibleMethod = expandOpts.visibleMethod;
        var slots = column.slots;
        var defaultSlot = slots ? slots.default : null;
        var iconSlot = slots ? slots.icon : null;
        var isAceived = false;
        var isLazyLoaded = false;
        if (iconSlot) {
            return $table.callSlot(iconSlot, params);
        }
        if (!isHidden) {
            isAceived = $table.findRowIndexOf(rowExpandeds, params.row) > -1;
            if (lazy) {
                isLazyLoaded = $table.findRowIndexOf(expandLazyLoadeds, row) > -1;
            }
        }
        return [
            showIcon && (!visibleMethod || visibleMethod(params)) ? h('span', {
                class: ['vxe-table--expanded', {
                        'is--active': isAceived
                    }],
                onClick: function (evnt) {
                    $table.triggerRowExpandEvent(evnt, params);
                }
            }, [
                h('i', {
                    class: ['vxe-table--expand-btn', isLazyLoaded ? (iconLoaded || GlobalConfig.icon.TABLE_EXPAND_LOADED) : (isAceived ? (iconOpen || GlobalConfig.icon.TABLE_EXPAND_OPEN) : (iconClose || GlobalConfig.icon.TABLE_EXPAND_CLOSE))]
                })
            ]) : null,
            defaultSlot || labelField ? h('span', {
                class: 'vxe-table--expand-label'
            }, defaultSlot ? $table.callSlot(defaultSlot, params) : XEUtils.get(row, labelField)) : null
        ];
    },
    renderExpandData: function (params) {
        var $table = params.$table, column = params.column;
        var slots = column.slots, contentRender = column.contentRender;
        var contentSlot = slots ? slots.content : null;
        if (contentSlot) {
            return $table.callSlot(contentSlot, params);
        }
        if (contentRender) {
            var compConf = VXETable.renderer.get(contentRender.name);
            if (compConf && compConf.renderExpand) {
                return compConf.renderExpand(contentRender, params);
            }
        }
        return [];
    },
    /**
     * HTML ??????
     */
    renderHTMLCell: function (params) {
        var $table = params.$table, column = params.column;
        var slots = column.slots;
        var defaultSlot = slots ? slots.default : null;
        if (defaultSlot) {
            return $table.callSlot(defaultSlot, params);
        }
        return [
            h('span', {
                class: 'vxe-cell--html',
                innerHTML: getDefaultCellLabel(params)
            })
        ];
    },
    renderTreeHTMLCell: function (params) {
        return Cell.renderTreeIcon(params, Cell.renderHTMLCell(params));
    },
    /**
     * ???????????????
     */
    renderSortAndFilterHeader: function (params) {
        return Cell.renderDefaultHeader(params)
            .concat(Cell.renderSortIcon(params))
            .concat(Cell.renderFilterIcon(params));
    },
    /**
     * ??????
     */
    renderSortHeader: function (params) {
        return Cell.renderDefaultHeader(params).concat(Cell.renderSortIcon(params));
    },
    renderSortIcon: function (params) {
        var $table = params.$table, column = params.column;
        var computeSortOpts = $table.getComputeMaps().computeSortOpts;
        var sortOpts = computeSortOpts.value;
        var showIcon = sortOpts.showIcon, iconAsc = sortOpts.iconAsc, iconDesc = sortOpts.iconDesc;
        var order = column.order;
        return showIcon ? [
            h('span', {
                class: 'vxe-cell--sort'
            }, [
                h('i', {
                    class: ['vxe-sort--asc-btn', iconAsc || GlobalConfig.icon.TABLE_SORT_ASC, {
                            'sort--active': order === 'asc'
                        }],
                    title: GlobalConfig.i18n('vxe.table.sortAsc'),
                    onClick: function (evnt) {
                        $table.triggerSortEvent(evnt, column, 'asc');
                    }
                }),
                h('i', {
                    class: ['vxe-sort--desc-btn', iconDesc || GlobalConfig.icon.TABLE_SORT_DESC, {
                            'sort--active': order === 'desc'
                        }],
                    title: GlobalConfig.i18n('vxe.table.sortDesc'),
                    onClick: function (evnt) {
                        $table.triggerSortEvent(evnt, column, 'desc');
                    }
                })
            ])
        ] : [];
    },
    /**
     * ??????
     */
    renderFilterHeader: function (params) {
        return Cell.renderDefaultHeader(params).concat(Cell.renderFilterIcon(params));
    },
    renderFilterIcon: function (params) {
        var $table = params.$table, column = params.column, hasFilter = params.hasFilter;
        var reactData = $table.reactData;
        var filterStore = reactData.filterStore;
        var computeFilterOpts = $table.getComputeMaps().computeFilterOpts;
        var filterOpts = computeFilterOpts.value;
        var showIcon = filterOpts.showIcon, iconNone = filterOpts.iconNone, iconMatch = filterOpts.iconMatch;
        return showIcon ? [
            h('span', {
                class: ['vxe-cell--filter', {
                        'is--active': filterStore.visible && filterStore.column === column
                    }]
            }, [
                h('i', {
                    class: ['vxe-filter--btn', hasFilter ? (iconMatch || GlobalConfig.icon.TABLE_FILTER_MATCH) : (iconNone || GlobalConfig.icon.TABLE_FILTER_NONE)],
                    title: GlobalConfig.i18n('vxe.table.filter'),
                    onClick: function (evnt) {
                        $table.triggerFilterEvent(evnt, params.column, params);
                    }
                })
            ])
        ] : [];
    },
    /**
     * ?????????
     */
    renderEditHeader: function (params) {
        var $table = params.$table, column = params.column;
        var props = $table.props;
        var computeEditOpts = $table.getComputeMaps().computeEditOpts;
        var editConfig = props.editConfig, editRules = props.editRules;
        var editOpts = computeEditOpts.value;
        var sortable = column.sortable, filters = column.filters, editRender = column.editRender;
        var isRequired = false;
        if (editRules) {
            var columnRules = XEUtils.get(editRules, params.column.property);
            if (columnRules) {
                isRequired = columnRules.some(function (rule) { return rule.required; });
            }
        }
        return (isEnableConf(editConfig) ? [
            isRequired && editOpts.showAsterisk ? h('i', {
                class: 'vxe-cell--required-icon'
            }) : null,
            isEnableConf(editRender) && editOpts.showIcon ? h('i', {
                class: ['vxe-cell--edit-icon', editOpts.icon || GlobalConfig.icon.TABLE_EDIT]
            }) : null
        ] : []).concat(Cell.renderDefaultHeader(params))
            .concat(sortable ? Cell.renderSortIcon(params) : [])
            .concat(filters ? Cell.renderFilterIcon(params) : []);
    },
    // ??????????????????
    renderRowEdit: function (params) {
        var $table = params.$table, column = params.column;
        var reactData = $table.reactData;
        var editStore = reactData.editStore;
        var actived = editStore.actived;
        var editRender = column.editRender;
        return Cell.runRenderer(params, isEnableConf(editRender) && actived && actived.row === params.row);
    },
    renderTreeRowEdit: function (params) {
        return Cell.renderTreeIcon(params, Cell.renderRowEdit(params));
    },
    // ?????????????????????
    renderCellEdit: function (params) {
        var $table = params.$table, column = params.column;
        var reactData = $table.reactData;
        var editStore = reactData.editStore;
        var actived = editStore.actived;
        var editRender = column.editRender;
        return Cell.runRenderer(params, isEnableConf(editRender) && actived && actived.row === params.row && actived.column === params.column);
    },
    renderTreeCellEdit: function (params) {
        return Cell.renderTreeIcon(params, Cell.renderCellEdit(params));
    },
    runRenderer: function (params, isEdit) {
        var $table = params.$table, column = params.column;
        var slots = column.slots, editRender = column.editRender, formatter = column.formatter;
        var defaultSlot = slots ? slots.default : null;
        var editSlot = slots ? slots.edit : null;
        var compConf = VXETable.renderer.get(editRender.name);
        if (isEdit) {
            if (editSlot) {
                return $table.callSlot(editSlot, params);
            }
            return compConf && compConf.renderEdit ? compConf.renderEdit(editRender, Object.assign({ $type: 'edit' }, params)) : [];
        }
        if (defaultSlot) {
            return $table.callSlot(defaultSlot, params);
        }
        if (formatter) {
            return [
                h('span', {
                    class: 'vxe-cell--label'
                }, getDefaultCellLabel(params))
            ];
        }
        return Cell.renderDefaultCell(params);
    }
};
export default Cell;
