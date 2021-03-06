import XEUtils from 'xe-utils';
import { browse, hasClass, getAbsolutePos, addClass, removeClass, getEventTargetNode } from '../../tools/dom';
function getTargetOffset(target, container) {
    var offsetTop = 0;
    var offsetLeft = 0;
    var triggerCheckboxLabel = !browse.firefox && hasClass(target, 'vxe-checkbox--label');
    if (triggerCheckboxLabel) {
        var checkboxLabelStyle = getComputedStyle(target);
        offsetTop -= XEUtils.toNumber(checkboxLabelStyle.paddingTop);
        offsetLeft -= XEUtils.toNumber(checkboxLabelStyle.paddingLeft);
    }
    while (target && target !== container) {
        offsetTop += target.offsetTop;
        offsetLeft += target.offsetLeft;
        target = target.offsetParent;
        if (triggerCheckboxLabel) {
            var checkboxStyle = getComputedStyle(target);
            offsetTop -= XEUtils.toNumber(checkboxStyle.paddingTop);
            offsetLeft -= XEUtils.toNumber(checkboxStyle.paddingLeft);
        }
    }
    return { offsetTop: offsetTop, offsetLeft: offsetLeft };
}
var tableKeyboardHook = {
    setupTable: function ($xetable) {
        var props = $xetable.props, reactData = $xetable.reactData, internalData = $xetable.internalData;
        var refElem = $xetable.getRefMaps().refElem;
        var _a = $xetable.getComputeMaps(), computeEditOpts = _a.computeEditOpts, computeCheckboxOpts = _a.computeCheckboxOpts, computeMouseOpts = _a.computeMouseOpts, computeTreeOpts = _a.computeTreeOpts;
        function getCheckboxRangeRows(params, targetTrElem, moveRange) {
            var countHeight = 0;
            var rangeRows = [];
            var isDown = moveRange > 0;
            var moveSize = moveRange > 0 ? moveRange : (Math.abs(moveRange) + targetTrElem.offsetHeight);
            var scrollYLoad = reactData.scrollYLoad;
            var afterFullData = internalData.afterFullData, scrollYStore = internalData.scrollYStore;
            if (scrollYLoad) {
                var _rowIndex = $xetable.getVTRowIndex(params.row);
                if (isDown) {
                    rangeRows = afterFullData.slice(_rowIndex, _rowIndex + Math.ceil(moveSize / scrollYStore.rowHeight));
                }
                else {
                    rangeRows = afterFullData.slice(_rowIndex - Math.floor(moveSize / scrollYStore.rowHeight) + 1, _rowIndex + 1);
                }
            }
            else {
                var siblingProp = isDown ? 'next' : 'previous';
                while (targetTrElem && countHeight < moveSize) {
                    var rowNodeRest = $xetable.getRowNode(targetTrElem);
                    if (rowNodeRest) {
                        rangeRows.push(rowNodeRest.item);
                        countHeight += targetTrElem.offsetHeight;
                        targetTrElem = targetTrElem[siblingProp + "ElementSibling"];
                    }
                }
            }
            return rangeRows;
        }
        var handleCheckboxRangeEvent = function (evnt, params) {
            var column = params.column, cell = params.cell;
            if (column.type === 'checkbox') {
                var el_1 = refElem.value;
                var elemStore = internalData.elemStore;
                var disX_1 = evnt.clientX;
                var disY_1 = evnt.clientY;
                var bodyWrapperElem_1 = elemStore[(column.fixed || 'main') + "-body-wrapper"] || elemStore['main-body-wrapper'];
                var checkboxRangeElem_1 = bodyWrapperElem_1.querySelector('.vxe-table--checkbox-range');
                var domMousemove_1 = document.onmousemove;
                var domMouseup_1 = document.onmouseup;
                var trElem_1 = cell.parentNode;
                var selectRecords_1 = $xetable.getCheckboxRecords();
                var lastRangeRows_1 = [];
                var marginSize_1 = 1;
                var offsetRest = getTargetOffset(evnt.target, bodyWrapperElem_1);
                var startTop_1 = offsetRest.offsetTop + evnt.offsetY;
                var startLeft_1 = offsetRest.offsetLeft + evnt.offsetX;
                var startScrollTop_1 = bodyWrapperElem_1.scrollTop;
                var rowHeight_1 = trElem_1.offsetHeight;
                var mouseScrollTimeout_1 = null;
                var isMouseScrollDown_1 = false;
                var mouseScrollSpaceSize_1 = 1;
                var triggerEvent_1 = function (type, evnt) {
                    $xetable.dispatchEvent("checkbox-range-" + type, { records: $xetable.getCheckboxRecords(), reserves: $xetable.getCheckboxReserveRecords() }, evnt);
                };
                var handleChecked_1 = function (evnt) {
                    var clientX = evnt.clientX, clientY = evnt.clientY;
                    var offsetLeft = clientX - disX_1;
                    var offsetTop = clientY - disY_1 + (bodyWrapperElem_1.scrollTop - startScrollTop_1);
                    var rangeHeight = Math.abs(offsetTop);
                    var rangeWidth = Math.abs(offsetLeft);
                    var rangeTop = startTop_1;
                    var rangeLeft = startLeft_1;
                    if (offsetTop < marginSize_1) {
                        // ??????
                        rangeTop += offsetTop;
                        if (rangeTop < marginSize_1) {
                            rangeTop = marginSize_1;
                            rangeHeight = startTop_1;
                        }
                    }
                    else {
                        // ??????
                        rangeHeight = Math.min(rangeHeight, bodyWrapperElem_1.scrollHeight - startTop_1 - marginSize_1);
                    }
                    if (offsetLeft < marginSize_1) {
                        // ??????
                        rangeLeft += offsetLeft;
                        if (rangeWidth > startLeft_1) {
                            rangeLeft = marginSize_1;
                            rangeWidth = startLeft_1;
                        }
                    }
                    else {
                        // ??????
                        rangeWidth = Math.min(rangeWidth, bodyWrapperElem_1.clientWidth - startLeft_1 - marginSize_1);
                    }
                    checkboxRangeElem_1.style.height = rangeHeight + "px";
                    checkboxRangeElem_1.style.width = rangeWidth + "px";
                    checkboxRangeElem_1.style.left = rangeLeft + "px";
                    checkboxRangeElem_1.style.top = rangeTop + "px";
                    checkboxRangeElem_1.style.display = 'block';
                    var rangeRows = getCheckboxRangeRows(params, trElem_1, offsetTop < marginSize_1 ? -rangeHeight : rangeHeight);
                    // ???????????? 10px ??????????????????
                    if (rangeHeight > 10 && rangeRows.length !== lastRangeRows_1.length) {
                        lastRangeRows_1 = rangeRows;
                        if (evnt.ctrlKey) {
                            rangeRows.forEach(function (row) {
                                $xetable.handleSelectRow({ row: row }, selectRecords_1.indexOf(row) === -1);
                            });
                        }
                        else {
                            $xetable.setAllCheckboxRow(false);
                            $xetable.setCheckboxRow(rangeRows, true);
                        }
                        triggerEvent_1('change', evnt);
                    }
                };
                // ??????????????????
                var stopMouseScroll_1 = function () {
                    clearTimeout(mouseScrollTimeout_1);
                    mouseScrollTimeout_1 = null;
                };
                // ??????????????????
                var startMouseScroll_1 = function (evnt) {
                    stopMouseScroll_1();
                    mouseScrollTimeout_1 = setTimeout(function () {
                        if (mouseScrollTimeout_1) {
                            var scrollLeft = bodyWrapperElem_1.scrollLeft, scrollTop = bodyWrapperElem_1.scrollTop, clientHeight = bodyWrapperElem_1.clientHeight, scrollHeight = bodyWrapperElem_1.scrollHeight;
                            var topSize = Math.ceil(mouseScrollSpaceSize_1 * 50 / rowHeight_1);
                            if (isMouseScrollDown_1) {
                                if (scrollTop + clientHeight < scrollHeight) {
                                    $xetable.scrollTo(scrollLeft, scrollTop + topSize);
                                    startMouseScroll_1(evnt);
                                    handleChecked_1(evnt);
                                }
                                else {
                                    stopMouseScroll_1();
                                }
                            }
                            else {
                                if (scrollTop) {
                                    $xetable.scrollTo(scrollLeft, scrollTop - topSize);
                                    startMouseScroll_1(evnt);
                                    handleChecked_1(evnt);
                                }
                                else {
                                    stopMouseScroll_1();
                                }
                            }
                        }
                    }, 50);
                };
                addClass(el_1, 'drag--range');
                document.onmousemove = function (evnt) {
                    evnt.preventDefault();
                    evnt.stopPropagation();
                    var clientY = evnt.clientY;
                    var boundingTop = getAbsolutePos(bodyWrapperElem_1).boundingTop;
                    // ????????????????????????????????????
                    if (clientY < boundingTop) {
                        isMouseScrollDown_1 = false;
                        mouseScrollSpaceSize_1 = boundingTop - clientY;
                        if (!mouseScrollTimeout_1) {
                            startMouseScroll_1(evnt);
                        }
                    }
                    else if (clientY > boundingTop + bodyWrapperElem_1.clientHeight) {
                        isMouseScrollDown_1 = true;
                        mouseScrollSpaceSize_1 = clientY - boundingTop - bodyWrapperElem_1.clientHeight;
                        if (!mouseScrollTimeout_1) {
                            startMouseScroll_1(evnt);
                        }
                    }
                    else if (mouseScrollTimeout_1) {
                        stopMouseScroll_1();
                    }
                    handleChecked_1(evnt);
                };
                document.onmouseup = function (evnt) {
                    stopMouseScroll_1();
                    removeClass(el_1, 'drag--range');
                    checkboxRangeElem_1.removeAttribute('style');
                    document.onmousemove = domMousemove_1;
                    document.onmouseup = domMouseup_1;
                    triggerEvent_1('end', evnt);
                };
                triggerEvent_1('start', evnt);
            }
        };
        var handleCellMousedownEvent = function (evnt, params) {
            var editConfig = props.editConfig, checkboxConfig = props.checkboxConfig, mouseConfig = props.mouseConfig;
            var checkboxOpts = computeCheckboxOpts.value;
            var mouseOpts = computeMouseOpts.value;
            var editOpts = computeEditOpts.value;
            if (mouseConfig && mouseOpts.area && $xetable.handleCellAreaEvent) {
                return $xetable.handleCellAreaEvent(evnt, params);
            }
            else {
                if (checkboxConfig && checkboxOpts.range) {
                    handleCheckboxRangeEvent(evnt, params);
                }
                if (mouseConfig && mouseOpts.selected) {
                    if (!editConfig || editOpts.mode === 'cell') {
                        $xetable.handleSelected(params, evnt);
                    }
                }
            }
        };
        var keyboardMethods = {
            // ?????? Tab ?????????
            moveTabSelected: function (args, isLeft, evnt) {
                var editConfig = props.editConfig;
                var afterFullData = internalData.afterFullData, visibleColumn = internalData.visibleColumn;
                var editOpts = computeEditOpts.value;
                var targetRow;
                var targetRowIndex;
                var targetColumnIndex;
                var params = Object.assign({}, args);
                var _rowIndex = $xetable.getVTRowIndex(params.row);
                var _columnIndex = $xetable.getVTColumnIndex(params.column);
                evnt.preventDefault();
                if (isLeft) {
                    // ??????
                    if (_columnIndex <= 0) {
                        // ????????????????????????????????????????????????
                        if (_rowIndex > 0) {
                            targetRowIndex = _rowIndex - 1;
                            targetRow = afterFullData[targetRowIndex];
                            targetColumnIndex = visibleColumn.length - 1;
                        }
                    }
                    else {
                        targetColumnIndex = _columnIndex - 1;
                    }
                }
                else {
                    if (_columnIndex >= visibleColumn.length - 1) {
                        // ????????????????????????????????????????????????
                        if (_rowIndex < afterFullData.length - 1) {
                            targetRowIndex = _rowIndex + 1;
                            targetRow = afterFullData[targetRowIndex];
                            targetColumnIndex = 0;
                        }
                    }
                    else {
                        targetColumnIndex = _columnIndex + 1;
                    }
                }
                var targetColumn = visibleColumn[targetColumnIndex];
                if (targetColumn) {
                    if (targetRow) {
                        params.rowIndex = targetRowIndex;
                        params.row = targetRow;
                    }
                    else {
                        params.rowIndex = _rowIndex;
                    }
                    params.columnIndex = targetColumnIndex;
                    params.column = targetColumn;
                    params.cell = $xetable.getCell(params.row, params.column);
                    if (editConfig) {
                        if (editOpts.trigger === 'click' || editOpts.trigger === 'dblclick') {
                            if (editOpts.mode === 'row') {
                                $xetable.handleActived(params, evnt);
                            }
                            else {
                                $xetable.scrollToRow(params.row, params.column)
                                    .then(function () { return $xetable.handleSelected(params, evnt); });
                            }
                        }
                    }
                    else {
                        $xetable.scrollToRow(params.row, params.column)
                            .then(function () { return $xetable.handleSelected(params, evnt); });
                    }
                }
            },
            // ??????????????????????????????
            moveCurrentRow: function (isUpArrow, isDwArrow, evnt) {
                var treeConfig = props.treeConfig;
                var currentRow = reactData.currentRow;
                var afterFullData = internalData.afterFullData;
                var treeOpts = computeTreeOpts.value;
                var targetRow;
                evnt.preventDefault();
                if (currentRow) {
                    if (treeConfig) {
                        var _a = XEUtils.findTree(afterFullData, function (item) { return item === currentRow; }, treeOpts), index = _a.index, items = _a.items;
                        if (isUpArrow && index > 0) {
                            targetRow = items[index - 1];
                        }
                        else if (isDwArrow && index < items.length - 1) {
                            targetRow = items[index + 1];
                        }
                    }
                    else {
                        var _rowIndex = $xetable.getVTRowIndex(currentRow);
                        if (isUpArrow && _rowIndex > 0) {
                            targetRow = afterFullData[_rowIndex - 1];
                        }
                        else if (isDwArrow && _rowIndex < afterFullData.length - 1) {
                            targetRow = afterFullData[_rowIndex + 1];
                        }
                    }
                }
                else {
                    targetRow = afterFullData[0];
                }
                if (targetRow) {
                    var params_1 = {
                        $table: $xetable,
                        row: targetRow,
                        rowIndex: $xetable.getRowIndex(targetRow),
                        $rowIndex: $xetable.getVMRowIndex(targetRow)
                    };
                    $xetable.scrollToRow(targetRow)
                        .then(function () { return $xetable.triggerCurrentRowEvent(evnt, params_1); });
                }
            },
            // ??????????????????????????????
            moveSelected: function (args, isLeftArrow, isUpArrow, isRightArrow, isDwArrow, evnt) {
                var afterFullData = internalData.afterFullData, visibleColumn = internalData.visibleColumn;
                var params = Object.assign({}, args);
                var _rowIndex = $xetable.getVTRowIndex(params.row);
                var _columnIndex = $xetable.getVTColumnIndex(params.column);
                evnt.preventDefault();
                if (isUpArrow && _rowIndex > 0) {
                    // ??????????????????
                    params.rowIndex = _rowIndex - 1;
                    params.row = afterFullData[params.rowIndex];
                }
                else if (isDwArrow && _rowIndex < afterFullData.length - 1) {
                    // ??????????????????
                    params.rowIndex = _rowIndex + 1;
                    params.row = afterFullData[params.rowIndex];
                }
                else if (isLeftArrow && _columnIndex) {
                    // ????????????????????????
                    params.columnIndex = _columnIndex - 1;
                    params.column = visibleColumn[params.columnIndex];
                }
                else if (isRightArrow && _columnIndex < visibleColumn.length - 1) {
                    // ????????????????????????
                    params.columnIndex = _columnIndex + 1;
                    params.column = visibleColumn[params.columnIndex];
                }
                $xetable.scrollToRow(params.row, params.column).then(function () {
                    params.cell = $xetable.getCell(params.row, params.column);
                    $xetable.handleSelected(params, evnt);
                });
            },
            /**
             * ???????????????????????????
             */
            triggerHeaderCellMousedownEvent: function (evnt, params) {
                var mouseConfig = props.mouseConfig;
                var mouseOpts = computeMouseOpts.value;
                if (mouseConfig && mouseOpts.area && $xetable.handleHeaderCellAreaEvent) {
                    var cell = evnt.currentTarget;
                    var triggerSort = getEventTargetNode(evnt, cell, 'vxe-cell--sort').flag;
                    var triggerFilter = getEventTargetNode(evnt, cell, 'vxe-cell--filter').flag;
                    $xetable.handleHeaderCellAreaEvent(evnt, Object.assign({ cell: cell, triggerSort: triggerSort, triggerFilter: triggerFilter }, params));
                }
                $xetable.focus();
                if ($xetable.closeMenu) {
                    $xetable.closeMenu();
                }
            },
            /**
             * ?????????????????????
             */
            triggerCellMousedownEvent: function (evnt, params) {
                var cell = evnt.currentTarget;
                params.cell = cell;
                handleCellMousedownEvent(evnt, params);
                $xetable.focus();
                $xetable.closeFilter();
                if ($xetable.closeMenu) {
                    $xetable.closeMenu();
                }
            }
        };
        return keyboardMethods;
    }
};
export default tableKeyboardHook;
