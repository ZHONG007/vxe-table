"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _vue = require("vue");

var _xeUtils = _interopRequireDefault(require("xe-utils"));

var _conf = _interopRequireDefault(require("../../v-x-e-table/src/conf"));

var _vXETable = require("../../v-x-e-table");

var _util = require("../../table/src/util");

var _utils = require("../../tools/utils");

var _util2 = require("./util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var htmlCellElem;
var csvBOM = "\uFEFF";
var enterSymbol = '\r\n';

function defaultFilterExportColumn(column) {
  return column.property || ['seq', 'checkbox', 'radio'].indexOf(column.type) > -1;
}

var getConvertColumns = function getConvertColumns(columns) {
  var result = [];
  columns.forEach(function (column) {
    if (column.childNodes && column.childNodes.length) {
      result.push(column);
      result.push.apply(result, getConvertColumns(column.childNodes));
    } else {
      result.push(column);
    }
  });
  return result;
};

var convertToRows = function convertToRows(originColumns) {
  var maxLevel = 1;

  var traverse = function traverse(column, parent) {
    if (parent) {
      column._level = parent._level + 1;

      if (maxLevel < column._level) {
        maxLevel = column._level;
      }
    }

    if (column.childNodes && column.childNodes.length) {
      var colSpan_1 = 0;
      column.childNodes.forEach(function (subColumn) {
        traverse(subColumn, column);
        colSpan_1 += subColumn._colSpan;
      });
      column._colSpan = colSpan_1;
    } else {
      column._colSpan = 1;
    }
  };

  originColumns.forEach(function (column) {
    column._level = 1;
    traverse(column);
  });
  var rows = [];

  for (var i = 0; i < maxLevel; i++) {
    rows.push([]);
  }

  var allColumns = getConvertColumns(originColumns);
  allColumns.forEach(function (column) {
    if (column.childNodes && column.childNodes.length) {
      column._rowSpan = 1;
    } else {
      column._rowSpan = maxLevel - column._level + 1;
    }

    rows[column._level - 1].push(column);
  });
  return rows;
};

function toTableBorder(border) {
  if (border === true) {
    return 'full';
  }

  if (border) {
    return border;
  }

  return 'default';
}

function getBooleanValue(cellValue) {
  return cellValue === 'TRUE' || cellValue === 'true' || cellValue === true;
}

function getHeaderTitle(opts, column) {
  return (opts.original ? column.property : column.getTitle()) || '';
}

function getFooterData(opts, footerTableData) {
  var footerFilterMethod = opts.footerFilterMethod;
  return footerFilterMethod ? footerTableData.filter(function (items, index) {
    return footerFilterMethod({
      items: items,
      $rowIndex: index
    });
  }) : footerTableData;
}

function getCsvCellTypeLabel(column, cellValue) {
  if (cellValue) {
    switch (column.cellType) {
      case 'string':
        if (!isNaN(cellValue)) {
          return "\t" + cellValue;
        }

        break;

      case 'number':
        break;

      default:
        if (cellValue.length >= 12 && !isNaN(cellValue)) {
          return "\t" + cellValue;
        }

        break;
    }
  }

  return cellValue;
}

function toTxtCellLabel(val) {
  if (/[",\s\n]/.test(val)) {
    return "\"" + val.replace(/"/g, '""') + "\"";
  }

  return val;
}

function getElementsByTagName(elem, qualifiedName) {
  return elem.getElementsByTagName(qualifiedName);
}

function getTxtCellKey(now) {
  return "#" + now + "@" + _xeUtils.default.uniqueId();
}

function replaceTxtCell(cell, vMaps) {
  return cell.replace(/#\d+@\d+/g, function (key) {
    return _xeUtils.default.hasOwnProp(vMaps, key) ? vMaps[key] : key;
  });
}

function getTxtCellValue(val, vMaps) {
  var rest = replaceTxtCell(val, vMaps);
  return rest.replace(/^"+$/g, function (qVal) {
    return '"'.repeat(Math.ceil(qVal.length / 2));
  });
}

function parseCsvAndTxt(columns, content, cellSeparator) {
  var list = content.split(enterSymbol);
  var rows = [];
  var fields = [];

  if (list.length) {
    var vMaps_1 = {};
    var now_1 = Date.now();
    list.forEach(function (rVal) {
      if (rVal) {
        var item_1 = {};
        rVal = rVal.replace(/("")|(\n)/g, function (text, dVal) {
          var key = getTxtCellKey(now_1);
          vMaps_1[key] = dVal ? '"' : '\n';
          return key;
        }).replace(/"(.*?)"/g, function (text, cVal) {
          var key = getTxtCellKey(now_1);
          vMaps_1[key] = replaceTxtCell(cVal, vMaps_1);
          return key;
        });
        var cells = rVal.split(cellSeparator);

        if (!fields.length) {
          fields = cells.map(function (val) {
            return getTxtCellValue(val.trim(), vMaps_1);
          });
        } else {
          cells.forEach(function (val, colIndex) {
            if (colIndex < fields.length) {
              item_1[fields[colIndex]] = getTxtCellValue(val.trim(), vMaps_1);
            }
          });
          rows.push(item_1);
        }
      }
    });
  }

  return {
    fields: fields,
    rows: rows
  };
}

function parseCsv(columns, content) {
  return parseCsvAndTxt(columns, content, ',');
}

function parseTxt(columns, content) {
  return parseCsvAndTxt(columns, content, '\t');
}

function parseHTML(columns, content) {
  var domParser = new DOMParser();
  var xmlDoc = domParser.parseFromString(content, 'text/html');
  var bodyNodes = getElementsByTagName(xmlDoc, 'body');
  var rows = [];
  var fields = [];

  if (bodyNodes.length) {
    var tableNodes = getElementsByTagName(bodyNodes[0], 'table');

    if (tableNodes.length) {
      var theadNodes = getElementsByTagName(tableNodes[0], 'thead');

      if (theadNodes.length) {
        _xeUtils.default.arrayEach(getElementsByTagName(theadNodes[0], 'tr'), function (rowNode) {
          _xeUtils.default.arrayEach(getElementsByTagName(rowNode, 'th'), function (cellNode) {
            fields.push(cellNode.textContent);
          });
        });

        var tbodyNodes = getElementsByTagName(tableNodes[0], 'tbody');

        if (tbodyNodes.length) {
          _xeUtils.default.arrayEach(getElementsByTagName(tbodyNodes[0], 'tr'), function (rowNode) {
            var item = {};

            _xeUtils.default.arrayEach(getElementsByTagName(rowNode, 'td'), function (cellNode, colIndex) {
              if (fields[colIndex]) {
                item[fields[colIndex]] = cellNode.textContent || '';
              }
            });

            rows.push(item);
          });
        }
      }
    }
  }

  return {
    fields: fields,
    rows: rows
  };
}

function parseXML(columns, content) {
  var domParser = new DOMParser();
  var xmlDoc = domParser.parseFromString(content, 'application/xml');
  var sheetNodes = getElementsByTagName(xmlDoc, 'Worksheet');
  var rows = [];
  var fields = [];

  if (sheetNodes.length) {
    var tableNodes = getElementsByTagName(sheetNodes[0], 'Table');

    if (tableNodes.length) {
      var rowNodes = getElementsByTagName(tableNodes[0], 'Row');

      if (rowNodes.length) {
        _xeUtils.default.arrayEach(getElementsByTagName(rowNodes[0], 'Cell'), function (cellNode) {
          fields.push(cellNode.textContent);
        });

        _xeUtils.default.arrayEach(rowNodes, function (rowNode, index) {
          if (index) {
            var item_2 = {};
            var cellNodes = getElementsByTagName(rowNode, 'Cell');

            _xeUtils.default.arrayEach(cellNodes, function (cellNode, colIndex) {
              if (fields[colIndex]) {
                item_2[fields[colIndex]] = cellNode.textContent;
              }
            });

            rows.push(item_2);
          }
        });
      }
    }
  }

  return {
    fields: fields,
    rows: rows
  };
}

function clearColumnConvert(columns) {
  _xeUtils.default.eachTree(columns, function (column) {
    delete column._level;
    delete column._colSpan;
    delete column._rowSpan;
    delete column._children;
    delete column.childNodes;
  }, {
    children: 'children'
  });
}
/**
 * ??????????????????????????????
 * @param {Array} fields ???????????????
 * @param {Array} rows ????????????
 */


function checkImportData(columns, fields) {
  var tableFields = [];
  columns.forEach(function (column) {
    var field = column.property;

    if (field) {
      tableFields.push(field);
    }
  });
  return fields.some(function (field) {
    return tableFields.indexOf(field) > -1;
  });
}

var tableExportMethodKeys = ['exportData', 'importByFile', 'importData', 'saveFile', 'readFile', 'print', 'openImport', 'openExport', 'openPrint'];
var tableExportHook = {
  setupTable: function setupTable($xetable) {
    var props = $xetable.props,
        reactData = $xetable.reactData,
        internalData = $xetable.internalData;

    var _a = $xetable.getComputeMaps(),
        computeTreeOpts = _a.computeTreeOpts,
        computePrintOpts = _a.computePrintOpts,
        computeExportOpts = _a.computeExportOpts,
        computeImportOpts = _a.computeImportOpts,
        computeCustomOpts = _a.computeCustomOpts,
        computeSeqOpts = _a.computeSeqOpts,
        computeRadioOpts = _a.computeRadioOpts,
        computeCheckboxOpts = _a.computeCheckboxOpts;

    var $xegrid = (0, _vue.inject)('$xegrid', null);

    var hasTreeChildren = function hasTreeChildren(row) {
      var treeOpts = computeTreeOpts.value;
      return row[treeOpts.children] && row[treeOpts.children].length;
    };

    var getSeq = function getSeq(row, rowIndex, column, columnIndex) {
      var seqOpts = computeSeqOpts.value;
      var seqMethod = seqOpts.seqMethod || column.seqMethod;
      return seqMethod ? seqMethod({
        row: row,
        rowIndex: rowIndex,
        column: column,
        columnIndex: columnIndex
      }) : seqOpts.startIndex + rowIndex + 1;
    };

    var toBooleanValue = function toBooleanValue(cellValue) {
      return _xeUtils.default.isBoolean(cellValue) ? cellValue ? 'TRUE' : 'FALSE' : cellValue;
    };

    var getLabelData = function getLabelData(opts, columns, datas) {
      var isAllExpand = opts.isAllExpand;
      var treeConfig = props.treeConfig;
      var radioOpts = computeRadioOpts.value;
      var checkboxOpts = computeCheckboxOpts.value;
      var treeOpts = computeTreeOpts.value;

      if (!htmlCellElem) {
        htmlCellElem = document.createElement('div');
      }

      if (treeConfig) {
        // ??????????????????????????????????????????
        var rest_1 = [];

        _xeUtils.default.eachTree(datas, function (item, rowIndex, items, path, parent, nodes) {
          var row = item._row || item;
          var parentRow = parent && parent._row ? parent._row : parent;

          if (isAllExpand || !parentRow || $xetable.isTreeExpandByRow(parentRow)) {
            var hasRowChild = hasTreeChildren(row);
            var item_3 = {
              _row: row,
              _level: nodes.length - 1,
              _hasChild: hasRowChild,
              _expand: hasRowChild && $xetable.isTreeExpandByRow(row)
            };
            columns.forEach(function (column, columnIndex) {
              var cellValue = '';
              var renderOpts = column.editRender || column.cellRender;
              var exportLabelMethod = column.exportMethod;

              if (!exportLabelMethod && renderOpts && renderOpts.name) {
                var compConf = _vXETable.VXETable.renderer.get(renderOpts.name);

                if (compConf) {
                  exportLabelMethod = compConf.exportMethod;
                }
              }

              if (exportLabelMethod) {
                cellValue = exportLabelMethod({
                  $table: $xetable,
                  row: row,
                  column: column,
                  options: opts
                });
              } else {
                switch (column.type) {
                  case 'seq':
                    cellValue = getSeq(row, rowIndex, column, columnIndex);
                    break;

                  case 'checkbox':
                    cellValue = toBooleanValue($xetable.isCheckedByCheckboxRow(row));
                    item_3._checkboxLabel = checkboxOpts.labelField ? _xeUtils.default.get(row, checkboxOpts.labelField) : '';
                    item_3._checkboxDisabled = checkboxOpts.checkMethod && !checkboxOpts.checkMethod({
                      row: row
                    });
                    break;

                  case 'radio':
                    cellValue = toBooleanValue($xetable.isCheckedByRadioRow(row));
                    item_3._radioLabel = radioOpts.labelField ? _xeUtils.default.get(row, radioOpts.labelField) : '';
                    item_3._radioDisabled = radioOpts.checkMethod && !radioOpts.checkMethod({
                      row: row
                    });
                    break;

                  default:
                    if (opts.original) {
                      cellValue = (0, _util.getCellValue)(row, column);
                    } else {
                      cellValue = $xetable.getCellLabel(row, column);

                      if (column.type === 'html') {
                        htmlCellElem.innerHTML = cellValue;
                        cellValue = htmlCellElem.innerText.trim();
                      } else {
                        var cell = $xetable.getCell(row, column);

                        if (cell) {
                          cellValue = cell.innerText.trim();
                        }
                      }
                    }

                }
              }

              item_3[column.id] = _xeUtils.default.toValueString(cellValue);
            });
            rest_1.push(Object.assign(item_3, row));
          }
        }, treeOpts);

        return rest_1;
      }

      return datas.map(function (row, rowIndex) {
        var item = {
          _row: row
        };
        columns.forEach(function (column, columnIndex) {
          var cellValue = '';
          var renderOpts = column.editRender || column.cellRender;
          var exportLabelMethod = column.exportMethod;

          if (!exportLabelMethod && renderOpts && renderOpts.name) {
            var compConf = _vXETable.VXETable.renderer.get(renderOpts.name);

            if (compConf) {
              exportLabelMethod = compConf.exportMethod;
            }
          }

          if (exportLabelMethod) {
            cellValue = exportLabelMethod({
              $table: $xetable,
              row: row,
              column: column,
              options: opts
            });
          } else {
            switch (column.type) {
              case 'seq':
                cellValue = getSeq(row, rowIndex, column, columnIndex);
                break;

              case 'checkbox':
                cellValue = toBooleanValue($xetable.isCheckedByCheckboxRow(row));
                item._checkboxLabel = checkboxOpts.labelField ? _xeUtils.default.get(row, checkboxOpts.labelField) : '';
                item._checkboxDisabled = checkboxOpts.checkMethod && !checkboxOpts.checkMethod({
                  row: row
                });
                break;

              case 'radio':
                cellValue = toBooleanValue($xetable.isCheckedByRadioRow(row));
                item._radioLabel = radioOpts.labelField ? _xeUtils.default.get(row, radioOpts.labelField) : '';
                item._radioDisabled = radioOpts.checkMethod && !radioOpts.checkMethod({
                  row: row
                });
                break;

              default:
                if (opts.original) {
                  cellValue = (0, _util.getCellValue)(row, column);
                } else {
                  cellValue = $xetable.getCellLabel(row, column);

                  if (column.type === 'html') {
                    htmlCellElem.innerHTML = cellValue;
                    cellValue = htmlCellElem.innerText.trim();
                  } else {
                    var cell = $xetable.getCell(row, column);

                    if (cell) {
                      cellValue = cell.innerText.trim();
                    }
                  }
                }

            }
          }

          item[column.id] = _xeUtils.default.toValueString(cellValue);
        });
        return item;
      });
    };

    var getExportData = function getExportData(opts) {
      var columns = opts.columns,
          dataFilterMethod = opts.dataFilterMethod;
      var datas = opts.data;

      if (dataFilterMethod) {
        datas = datas.filter(function (row, index) {
          return dataFilterMethod({
            row: row,
            $rowIndex: index
          });
        });
      }

      return getLabelData(opts, columns, datas);
    };

    var getFooterCellValue = function getFooterCellValue(opts, items, column) {
      var renderOpts = column.editRender || column.cellRender;
      var exportLabelMethod = column.footerExportMethod;

      if (!exportLabelMethod && renderOpts && renderOpts.name) {
        var compConf = _vXETable.VXETable.renderer.get(renderOpts.name);

        if (compConf) {
          exportLabelMethod = compConf.footerExportMethod;
        }
      }

      var _columnIndex = $xetable.getVTColumnIndex(column);

      var cellValue = exportLabelMethod ? exportLabelMethod({
        $table: $xetable,
        items: items,
        itemIndex: _columnIndex,
        _columnIndex: _columnIndex,
        column: column,
        options: opts
      }) : _xeUtils.default.toValueString(items[_columnIndex]);
      return cellValue;
    };

    var toCsv = function toCsv(opts, columns, datas) {
      var content = csvBOM;

      if (opts.isHeader) {
        content += columns.map(function (column) {
          return toTxtCellLabel(getHeaderTitle(opts, column));
        }).join(',') + enterSymbol;
      }

      datas.forEach(function (row) {
        content += columns.map(function (column) {
          return toTxtCellLabel(getCsvCellTypeLabel(column, row[column.id]));
        }).join(',') + enterSymbol;
      });

      if (opts.isFooter) {
        var footerTableData = reactData.footerTableData;
        var footers = getFooterData(opts, footerTableData);
        footers.forEach(function (rows) {
          content += columns.map(function (column) {
            return toTxtCellLabel(getFooterCellValue(opts, rows, column));
          }).join(',') + enterSymbol;
        });
      }

      return content;
    };

    var toTxt = function toTxt(opts, columns, datas) {
      var content = '';

      if (opts.isHeader) {
        content += columns.map(function (column) {
          return toTxtCellLabel(getHeaderTitle(opts, column));
        }).join('\t') + enterSymbol;
      }

      datas.forEach(function (row) {
        content += columns.map(function (column) {
          return toTxtCellLabel(row[column.id]);
        }).join('\t') + enterSymbol;
      });

      if (opts.isFooter) {
        var footerTableData = reactData.footerTableData;
        var footers = getFooterData(opts, footerTableData);
        footers.forEach(function (rows) {
          content += columns.map(function (column) {
            return toTxtCellLabel(getFooterCellValue(opts, rows, column));
          }).join(',') + enterSymbol;
        });
      }

      return content;
    };

    var hasEllipsis = function hasEllipsis(column, property, allColumnOverflow) {
      var columnOverflow = column[property];
      var headOverflow = _xeUtils.default.isUndefined(columnOverflow) || _xeUtils.default.isNull(columnOverflow) ? allColumnOverflow : columnOverflow;
      var showEllipsis = headOverflow === 'ellipsis';
      var showTitle = headOverflow === 'title';
      var showTooltip = headOverflow === true || headOverflow === 'tooltip';
      var isEllipsis = showTitle || showTooltip || showEllipsis; // ?????????????????????????????????

      var scrollXLoad = reactData.scrollXLoad,
          scrollYLoad = reactData.scrollYLoad;

      if ((scrollXLoad || scrollYLoad) && !isEllipsis) {
        isEllipsis = true;
      }

      return isEllipsis;
    };

    var toHtml = function toHtml(opts, columns, datas) {
      var id = props.id,
          border = props.border,
          treeConfig = props.treeConfig,
          allHeaderAlign = props.headerAlign,
          allAlign = props.align,
          allFooterAlign = props.footerAlign,
          allColumnOverflow = props.showOverflow,
          allColumnHeaderOverflow = props.showHeaderOverflow;
      var isAllSelected = reactData.isAllSelected,
          isIndeterminate = reactData.isIndeterminate,
          mergeList = reactData.mergeList;
      var treeOpts = computeTreeOpts.value;
      var isPrint = opts.print,
          isHeader = opts.isHeader,
          isFooter = opts.isFooter,
          isColgroup = opts.isColgroup,
          isMerge = opts.isMerge,
          colgroups = opts.colgroups,
          original = opts.original;
      var allCls = 'check-all';
      var clss = ['vxe-table', "border--" + toTableBorder(border), isPrint ? 'is--print' : '', isHeader ? 'is--header' : ''].filter(function (cls) {
        return cls;
      });
      var tables = ["<table class=\"" + clss.join(' ') + "\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">", "<colgroup>" + columns.map(function (column) {
        return "<col style=\"width:" + column.renderWidth + "px\">";
      }).join('') + "</colgroup>"];

      if (isHeader) {
        tables.push('<thead>');

        if (isColgroup && !original) {
          colgroups.forEach(function (cols) {
            tables.push("<tr>" + cols.map(function (column) {
              var headAlign = column.headerAlign || column.align || allHeaderAlign || allAlign;
              var classNames = hasEllipsis(column, 'showHeaderOverflow', allColumnHeaderOverflow) ? ['col--ellipsis'] : [];
              var cellTitle = getHeaderTitle(opts, column);
              var childWidth = 0;
              var countChild = 0;

              _xeUtils.default.eachTree([column], function (item) {
                if (!item.childNodes || !column.childNodes.length) {
                  countChild++;
                }

                childWidth += item.renderWidth;
              }, {
                children: 'childNodes'
              });

              var cellWidth = childWidth - countChild;

              if (headAlign) {
                classNames.push("col--" + headAlign);
              }

              if (column.type === 'checkbox') {
                return "<th class=\"" + classNames.join(' ') + "\" colspan=\"" + column._colSpan + "\" rowspan=\"" + column._rowSpan + "\"><div " + (isPrint ? '' : "style=\"width: " + cellWidth + "px\"") + "><input type=\"checkbox\" class=\"" + allCls + "\" " + (isAllSelected ? 'checked' : '') + "><span>" + cellTitle + "</span></div></th>";
              }

              return "<th class=\"" + classNames.join(' ') + "\" colspan=\"" + column._colSpan + "\" rowspan=\"" + column._rowSpan + "\" title=\"" + cellTitle + "\"><div " + (isPrint ? '' : "style=\"width: " + cellWidth + "px\"") + "><span>" + (0, _utils.formatText)(cellTitle, true) + "</span></div></th>";
            }).join('') + "</tr>");
          });
        } else {
          tables.push("<tr>" + columns.map(function (column) {
            var headAlign = column.headerAlign || column.align || allHeaderAlign || allAlign;
            var classNames = hasEllipsis(column, 'showHeaderOverflow', allColumnHeaderOverflow) ? ['col--ellipsis'] : [];
            var cellTitle = getHeaderTitle(opts, column);

            if (headAlign) {
              classNames.push("col--" + headAlign);
            }

            if (column.type === 'checkbox') {
              return "<th class=\"" + classNames.join(' ') + "\"><div " + (isPrint ? '' : "style=\"width: " + column.renderWidth + "px\"") + "><input type=\"checkbox\" class=\"" + allCls + "\" " + (isAllSelected ? 'checked' : '') + "><span>" + cellTitle + "</span></div></th>";
            }

            return "<th class=\"" + classNames.join(' ') + "\" title=\"" + cellTitle + "\"><div " + (isPrint ? '' : "style=\"width: " + column.renderWidth + "px\"") + "><span>" + (0, _utils.formatText)(cellTitle, true) + "</span></div></th>";
          }).join('') + "</tr>");
        }

        tables.push('</thead>');
      }

      if (datas.length) {
        tables.push('<tbody>');

        if (treeConfig) {
          datas.forEach(function (item) {
            tables.push('<tr>' + columns.map(function (column) {
              var cellAlign = column.align || allAlign;
              var classNames = hasEllipsis(column, 'showOverflow', allColumnOverflow) ? ['col--ellipsis'] : [];
              var cellValue = item[column.id];

              if (cellAlign) {
                classNames.push("col--" + cellAlign);
              }

              if (column.treeNode) {
                var treeIcon = '';

                if (item._hasChild) {
                  treeIcon = "<i class=\"" + (item._expand ? 'vxe-table--tree-fold-icon' : 'vxe-table--tree-unfold-icon') + "\"></i>";
                }

                classNames.push('vxe-table--tree-node');

                if (column.type === 'radio') {
                  return "<td class=\"" + classNames.join(' ') + "\" title=\"" + cellValue + "\"><div " + (isPrint ? '' : "style=\"width: " + column.renderWidth + "px\"") + "><div class=\"vxe-table--tree-node-wrapper\" style=\"padding-left: " + item._level * treeOpts.indent + "px\"><div class=\"vxe-table--tree-icon-wrapper\">" + treeIcon + "</div><div class=\"vxe-table--tree-cell\"><input type=\"radio\" name=\"radio_" + id + "\" " + (item._radioDisabled ? 'disabled ' : '') + (getBooleanValue(cellValue) ? 'checked' : '') + "><span>" + item._radioLabel + "</span></div></div></div></td>";
                } else if (column.type === 'checkbox') {
                  return "<td class=\"" + classNames.join(' ') + "\" title=\"" + cellValue + "\"><div " + (isPrint ? '' : "style=\"width: " + column.renderWidth + "px\"") + "><div class=\"vxe-table--tree-node-wrapper\" style=\"padding-left: " + item._level * treeOpts.indent + "px\"><div class=\"vxe-table--tree-icon-wrapper\">" + treeIcon + "</div><div class=\"vxe-table--tree-cell\"><input type=\"checkbox\" " + (item._checkboxDisabled ? 'disabled ' : '') + (getBooleanValue(cellValue) ? 'checked' : '') + "><span>" + item._checkboxLabel + "</span></div></div></div></td>";
                }

                return "<td class=\"" + classNames.join(' ') + "\" title=\"" + cellValue + "\"><div " + (isPrint ? '' : "style=\"width: " + column.renderWidth + "px\"") + "><div class=\"vxe-table--tree-node-wrapper\" style=\"padding-left: " + item._level * treeOpts.indent + "px\"><div class=\"vxe-table--tree-icon-wrapper\">" + treeIcon + "</div><div class=\"vxe-table--tree-cell\">" + cellValue + "</div></div></div></td>";
              }

              if (column.type === 'radio') {
                return "<td class=\"" + classNames.join(' ') + "\"><div " + (isPrint ? '' : "style=\"width: " + column.renderWidth + "px\"") + "><input type=\"radio\" name=\"radio_" + id + "\" " + (item._radioDisabled ? 'disabled ' : '') + (getBooleanValue(cellValue) ? 'checked' : '') + "><span>" + item._radioLabel + "</span></div></td>";
              } else if (column.type === 'checkbox') {
                return "<td class=\"" + classNames.join(' ') + "\"><div " + (isPrint ? '' : "style=\"width: " + column.renderWidth + "px\"") + "><input type=\"checkbox\" " + (item._checkboxDisabled ? 'disabled ' : '') + (getBooleanValue(cellValue) ? 'checked' : '') + "><span>" + item._checkboxLabel + "</span></div></td>";
              }

              return "<td class=\"" + classNames.join(' ') + "\" title=\"" + cellValue + "\"><div " + (isPrint ? '' : "style=\"width: " + column.renderWidth + "px\"") + ">" + (0, _utils.formatText)(cellValue, true) + "</div></td>";
            }).join('') + '</tr>');
          });
        } else {
          datas.forEach(function (item) {
            tables.push('<tr>' + columns.map(function (column) {
              var cellAlign = column.align || allAlign;
              var classNames = hasEllipsis(column, 'showOverflow', allColumnOverflow) ? ['col--ellipsis'] : [];
              var cellValue = item[column.id];
              var rowSpan = 1;
              var colSpan = 1;

              if (isMerge && mergeList.length) {
                var _rowIndex = $xetable.getVTRowIndex(item._row);

                var _columnIndex = $xetable.getVTColumnIndex(column);

                var spanRest = (0, _util.mergeBodyMethod)(mergeList, _rowIndex, _columnIndex);

                if (spanRest) {
                  var rowspan = spanRest.rowspan,
                      colspan = spanRest.colspan;

                  if (!rowspan || !colspan) {
                    return '';
                  }

                  if (rowspan > 1) {
                    rowSpan = rowspan;
                  }

                  if (colspan > 1) {
                    colSpan = colspan;
                  }
                }
              }

              if (cellAlign) {
                classNames.push("col--" + cellAlign);
              }

              if (column.type === 'radio') {
                return "<td class=\"" + classNames.join(' ') + "\" rowspan=\"" + rowSpan + "\" colspan=\"" + colSpan + "\"><div " + (isPrint ? '' : "style=\"width: " + column.renderWidth + "px\"") + "><input type=\"radio\" name=\"radio_" + id + "\" " + (item._radioDisabled ? 'disabled ' : '') + (getBooleanValue(cellValue) ? 'checked' : '') + "><span>" + item._radioLabel + "</span></div></td>";
              } else if (column.type === 'checkbox') {
                return "<td class=\"" + classNames.join(' ') + "\" rowspan=\"" + rowSpan + "\" colspan=\"" + colSpan + "\"><div " + (isPrint ? '' : "style=\"width: " + column.renderWidth + "px\"") + "><input type=\"checkbox\" " + (item._checkboxDisabled ? 'disabled ' : '') + (getBooleanValue(cellValue) ? 'checked' : '') + "><span>" + item._checkboxLabel + "</span></div></td>";
              }

              return "<td class=\"" + classNames.join(' ') + "\" rowspan=\"" + rowSpan + "\" colspan=\"" + colSpan + "\" title=\"" + cellValue + "\"><div " + (isPrint ? '' : "style=\"width: " + column.renderWidth + "px\"") + ">" + (0, _utils.formatText)(cellValue, true) + "</div></td>";
            }).join('') + '</tr>');
          });
        }

        tables.push('</tbody>');
      }

      if (isFooter) {
        var footerTableData = reactData.footerTableData;
        var footers = getFooterData(opts, footerTableData);

        if (footers.length) {
          tables.push('<tfoot>');
          footers.forEach(function (rows) {
            tables.push("<tr>" + columns.map(function (column) {
              var footAlign = column.footerAlign || column.align || allFooterAlign || allAlign;
              var classNames = hasEllipsis(column, 'showOverflow', allColumnOverflow) ? ['col--ellipsis'] : [];
              var cellValue = getFooterCellValue(opts, rows, column);

              if (footAlign) {
                classNames.push("col--" + footAlign);
              }

              return "<td class=\"" + classNames.join(' ') + "\" title=\"" + cellValue + "\"><div " + (isPrint ? '' : "style=\"width: " + column.renderWidth + "px\"") + ">" + (0, _utils.formatText)(cellValue, true) + "</div></td>";
            }).join('') + "</tr>");
          });
          tables.push('</tfoot>');
        }
      } // ??????????????????


      var script = !isAllSelected && isIndeterminate ? "<script>(function(){var a=document.querySelector(\"." + allCls + "\");if(a){a.indeterminate=true}})()</script>" : '';
      tables.push('</table>', script);
      return isPrint ? tables.join('') : (0, _util2.createHtmlPage)(opts, tables.join(''));
    };

    var toXML = function toXML(opts, columns, datas) {
      var xml = ['<?xml version="1.0"?>', '<?mso-application progid="Excel.Sheet"?>', '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40">', '<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">', '<Version>16.00</Version>', '</DocumentProperties>', '<ExcelWorkbook xmlns="urn:schemas-microsoft-com:office:excel">', '<WindowHeight>7920</WindowHeight>', '<WindowWidth>21570</WindowWidth>', '<WindowTopX>32767</WindowTopX>', '<WindowTopY>32767</WindowTopY>', '<ProtectStructure>False</ProtectStructure>', '<ProtectWindows>False</ProtectWindows>', '</ExcelWorkbook>', "<Worksheet ss:Name=\"" + opts.sheetName + "\">", '<Table>', columns.map(function (column) {
        return "<Column ss:Width=\"" + column.renderWidth + "\"/>";
      }).join('')].join('');

      if (opts.isHeader) {
        xml += "<Row>" + columns.map(function (column) {
          return "<Cell><Data ss:Type=\"String\">" + getHeaderTitle(opts, column) + "</Data></Cell>";
        }).join('') + "</Row>";
      }

      datas.forEach(function (row) {
        xml += '<Row>' + columns.map(function (column) {
          return "<Cell><Data ss:Type=\"String\">" + row[column.id] + "</Data></Cell>";
        }).join('') + '</Row>';
      });

      if (opts.isFooter) {
        var footerTableData = reactData.footerTableData;
        var footers = getFooterData(opts, footerTableData);
        footers.forEach(function (rows) {
          xml += "<Row>" + columns.map(function (column) {
            return "<Cell><Data ss:Type=\"String\">" + getFooterCellValue(opts, rows, column) + "</Data></Cell>";
          }).join('') + "</Row>";
        });
      }

      return xml + "</Table></Worksheet></Workbook>";
    };

    var getContent = function getContent(opts, columns, datas) {
      if (columns.length) {
        switch (opts.type) {
          case 'csv':
            return toCsv(opts, columns, datas);

          case 'txt':
            return toTxt(opts, columns, datas);

          case 'html':
            return toHtml(opts, columns, datas);

          case 'xml':
            return toXML(opts, columns, datas);
        }
      }

      return '';
    };

    var downloadFile = function downloadFile(opts, content) {
      var filename = opts.filename,
          type = opts.type,
          download = opts.download;

      if (!download) {
        var blob = (0, _util2.getExportBlobByContent)(content, opts);
        return Promise.resolve({
          type: type,
          content: content,
          blob: blob
        });
      }

      (0, _util2.saveLocalFile)({
        filename: filename,
        type: type,
        content: content
      }).then(function () {
        if (opts.message !== false) {
          _vXETable.VXETable.modal.message({
            content: _conf.default.i18n('vxe.table.expSuccess'),
            status: 'success'
          });
        }
      });
    };

    var handleExport = function handleExport(opts) {
      var remote = opts.remote,
          columns = opts.columns,
          colgroups = opts.colgroups,
          exportMethod = opts.exportMethod,
          afterExportMethod = opts.afterExportMethod;
      return new Promise(function (resolve) {
        if (remote) {
          var params = {
            options: opts,
            $table: $xetable,
            $grid: $xegrid
          };
          resolve(exportMethod ? exportMethod(params) : params);
        } else {
          var datas_1 = getExportData(opts);
          resolve($xetable.preventEvent(null, 'event.export', {
            options: opts,
            columns: columns,
            colgroups: colgroups,
            datas: datas_1
          }, function () {
            return downloadFile(opts, getContent(opts, columns, datas_1));
          }));
        }
      }).then(function (params) {
        clearColumnConvert(columns);

        if (!opts.print) {
          if (afterExportMethod) {
            afterExportMethod({
              status: true,
              options: opts,
              $table: $xetable,
              $grid: $xegrid
            });
          }
        }

        return Object.assign({
          status: true
        }, params);
      }).catch(function () {
        clearColumnConvert(columns);

        if (!opts.print) {
          if (afterExportMethod) {
            afterExportMethod({
              status: false,
              options: opts,
              $table: $xetable,
              $grid: $xegrid
            });
          }
        }

        var params = {
          status: false
        };
        return Promise.reject(params);
      });
    };

    var handleImport = function handleImport(content, opts) {
      var tableFullColumn = internalData.tableFullColumn,
          _importResolve = internalData._importResolve,
          _importReject = internalData._importReject;
      var rest = {
        fields: [],
        rows: []
      };

      switch (opts.type) {
        case 'csv':
          rest = parseCsv(tableFullColumn, content);
          break;

        case 'txt':
          rest = parseTxt(tableFullColumn, content);
          break;

        case 'html':
          rest = parseHTML(tableFullColumn, content);
          break;

        case 'xml':
          rest = parseXML(tableFullColumn, content);
          break;
      }

      var fields = rest.fields,
          rows = rest.rows;
      var status = checkImportData(tableFullColumn, fields);

      if (status) {
        $xetable.createData(rows).then(function (data) {
          var loadRest;

          if (opts.mode === 'insert') {
            loadRest = $xetable.insert(data);
          } else {
            loadRest = $xetable.reloadData(data);
          }

          if (opts.message !== false) {
            _vXETable.VXETable.modal.message({
              content: _conf.default.i18n('vxe.table.impSuccess', [rows.length]),
              status: 'success'
            });
          }

          return loadRest.then(function () {
            if (_importResolve) {
              _importResolve({
                status: true
              });
            }
          });
        });
      } else if (opts.message !== false) {
        _vXETable.VXETable.modal.message({
          content: _conf.default.i18n('vxe.error.impFields'),
          status: 'error'
        });

        if (_importReject) {
          _importReject({
            status: false
          });
        }
      }
    };

    var handleFileImport = function handleFileImport(file, opts) {
      var importMethod = opts.importMethod,
          afterImportMethod = opts.afterImportMethod;

      var _a = (0, _utils.parseFile)(file),
          type = _a.type,
          filename = _a.filename; // ??????????????????????????????????????????????????????????????????


      if (!importMethod && !_xeUtils.default.includes(_vXETable.VXETable.config.importTypes, type)) {
        if (opts.message !== false) {
          _vXETable.VXETable.modal.message({
            content: _conf.default.i18n('vxe.error.notType', [type]),
            status: 'error'
          });
        }

        var params = {
          status: false
        };
        return Promise.reject(params);
      }

      var rest = new Promise(function (resolve, reject) {
        var _importResolve = function _importResolve(params) {
          resolve(params);
          internalData._importResolve = null;
          internalData._importReject = null;
        };

        var _importReject = function _importReject(params) {
          reject(params);
          internalData._importResolve = null;
          internalData._importReject = null;
        };

        internalData._importResolve = _importResolve;
        internalData._importReject = _importReject;

        if (window.FileReader) {
          var options_1 = Object.assign({
            mode: 'insert'
          }, opts, {
            type: type,
            filename: filename
          });

          if (options_1.remote) {
            if (importMethod) {
              Promise.resolve(importMethod({
                file: file,
                options: options_1,
                $table: $xetable
              })).then(function () {
                _importResolve({
                  status: true
                });
              }).catch(function () {
                _importResolve({
                  status: true
                });
              });
            } else {
              _importResolve({
                status: true
              });
            }
          } else {
            var tableFullColumn = internalData.tableFullColumn;
            $xetable.preventEvent(null, 'event.import', {
              file: file,
              options: options_1,
              columns: tableFullColumn
            }, function () {
              var reader = new FileReader();

              reader.onerror = function () {
                (0, _utils.errLog)('vxe.error.notType', [type]);

                _importReject({
                  status: false
                });
              };

              reader.onload = function (e) {
                handleImport(e.target.result, options_1);
              };

              reader.readAsText(file, 'UTF-8');
            });
          }
        } else {
          // ?????????????????????
          if (process.env.NODE_ENV === 'development') {
            (0, _utils.errLog)('vxe.error.notExp');
          }

          _importResolve({
            status: true
          });
        }
      });
      return rest.then(function () {
        if (afterImportMethod) {
          afterImportMethod({
            status: true,
            options: opts,
            $table: $xetable
          });
        }
      }).catch(function (e) {
        if (afterImportMethod) {
          afterImportMethod({
            status: false,
            options: opts,
            $table: $xetable
          });
        }

        return Promise.reject(e);
      });
    };

    var handleExportAndPrint = function handleExportAndPrint(options, isPrint) {
      var treeConfig = props.treeConfig,
          showHeader = props.showHeader,
          showFooter = props.showFooter;
      var initStore = reactData.initStore,
          mergeList = reactData.mergeList,
          isGroup = reactData.isGroup,
          footerTableData = reactData.footerTableData,
          exportStore = reactData.exportStore,
          exportParams = reactData.exportParams;
      var collectColumn = internalData.collectColumn;
      var hasTree = treeConfig;
      var customOpts = computeCustomOpts.value;
      var selectRecords = $xetable.getCheckboxRecords();
      var hasFooter = !!footerTableData.length;
      var hasMerge = !hasTree && mergeList.length;
      var defOpts = Object.assign({
        message: true,
        isHeader: showHeader,
        isFooter: showFooter
      }, options);
      var types = defOpts.types || _vXETable.VXETable.config.exportTypes;
      var modes = defOpts.modes;
      var checkMethod = customOpts.checkMethod;
      var exportColumns = collectColumn.slice(0);
      var columns = defOpts.columns; // ????????????

      var typeList = types.map(function (value) {
        return {
          value: value,
          label: "vxe.export.types." + value
        };
      });
      var modeList = modes.map(function (value) {
        return {
          value: value,
          label: "vxe.export.modes." + value
        };
      }); // ????????????

      _xeUtils.default.eachTree(exportColumns, function (column, index, items, path, parent) {
        var isColGroup = column.children && column.children.length;

        if (isColGroup || defaultFilterExportColumn(column)) {
          column.checked = columns ? columns.some(function (item) {
            if ((0, _util.isColumnInfo)(item)) {
              return column === item;
            } else if (_xeUtils.default.isString(item)) {
              return column.field === item;
            } else {
              var colid = item.id || item.colId;
              var type = item.type;
              var field = item.property || item.field;

              if (colid) {
                return column.id === colid;
              } else if (field && type) {
                return column.property === field && column.type === type;
              } else if (field) {
                return column.property === field;
              } else if (type) {
                return column.type === type;
              }
            }
          }) : column.visible;
          column.halfChecked = false;
          column.disabled = parent && parent.disabled || (checkMethod ? !checkMethod({
            column: column
          }) : false);
        }
      }); // ????????????


      Object.assign(exportStore, {
        columns: exportColumns,
        typeList: typeList,
        modeList: modeList,
        hasFooter: hasFooter,
        hasMerge: hasMerge,
        hasTree: hasTree,
        isPrint: isPrint,
        hasColgroup: isGroup,
        visible: true
      }); // ????????????

      if (!initStore.export) {
        Object.assign(exportParams, {
          mode: selectRecords.length ? 'selected' : 'current'
        }, defOpts);
      }

      if (modes.indexOf(exportParams.mode) === -1) {
        exportParams.mode = modes[0];
      }

      if (types.indexOf(exportParams.type) === -1) {
        exportParams.type = types[0];
      }

      initStore.export = true;
      return (0, _vue.nextTick)();
    };

    var exportMethods = {
      /**
       * ????????????????????? csv/html/xml/txt
       * ???????????????????????????????????????????????????
       * ???????????????????????????????????????????????????????????????????????? dataFilterMethod ????????????????????????
       * @param {Object} options ??????
       */
      exportData: function exportData(options) {
        var treeConfig = props.treeConfig;
        var isGroup = reactData.isGroup,
            tableGroupColumn = reactData.tableGroupColumn;
        var tableFullColumn = internalData.tableFullColumn,
            afterFullData = internalData.afterFullData;
        var exportOpts = computeExportOpts.value;
        var treeOpts = computeTreeOpts.value;
        var opts = Object.assign({
          // filename: '',
          // sheetName: '',
          // original: false,
          // message: false,
          isHeader: true,
          isFooter: true,
          isColgroup: true,
          // isMerge: false,
          // isAllExpand: false,
          download: true,
          type: 'csv',
          mode: 'current' // data: null,
          // remote: false,
          // dataFilterMethod: null,
          // footerFilterMethod: null,
          // exportMethod: null,
          // columnFilterMethod: null,
          // beforeExportMethod: null,
          // afterExportMethod: null

        }, exportOpts, {
          print: false
        }, options);
        var type = opts.type,
            mode = opts.mode,
            columns = opts.columns,
            original = opts.original,
            beforeExportMethod = opts.beforeExportMethod;
        var groups = [];
        var customCols = columns && columns.length ? columns : null;
        var columnFilterMethod = opts.columnFilterMethod; // ????????????????????????????????????????????????????????????

        if (!customCols && !columnFilterMethod) {
          columnFilterMethod = original ? function (_a) {
            var column = _a.column;
            return column.property;
          } : function (_a) {
            var column = _a.column;
            return defaultFilterExportColumn(column);
          };
        }

        if (customCols) {
          groups = _xeUtils.default.searchTree(_xeUtils.default.mapTree(customCols, function (item) {
            var targetColumn;

            if (item) {
              if ((0, _util.isColumnInfo)(item)) {
                targetColumn = item;
              } else if (_xeUtils.default.isString(item)) {
                targetColumn = $xetable.getColumnByField(item);
              } else {
                var colid = item.id || item.colId;
                var type_1 = item.type;
                var field_1 = item.property || item.field;

                if (colid) {
                  targetColumn = $xetable.getColumnById(colid);
                } else if (field_1 && type_1) {
                  targetColumn = tableFullColumn.find(function (column) {
                    return column.property === field_1 && column.type === type_1;
                  });
                } else if (field_1) {
                  targetColumn = $xetable.getColumnByField(field_1);
                } else if (type_1) {
                  targetColumn = tableFullColumn.find(function (column) {
                    return column.type === type_1;
                  });
                }
              }

              return targetColumn || {};
            }
          }, {
            children: 'childNodes',
            mapChildren: '_children'
          }), function (column, index) {
            return (0, _util.isColumnInfo)(column) && (!columnFilterMethod || columnFilterMethod({
              column: column,
              $columnIndex: index
            }));
          }, {
            children: '_children',
            mapChildren: 'childNodes',
            original: true
          });
        } else {
          groups = _xeUtils.default.searchTree(isGroup ? tableGroupColumn : tableFullColumn, function (column, index) {
            return column.visible && (!columnFilterMethod || columnFilterMethod({
              column: column,
              $columnIndex: index
            }));
          }, {
            children: 'children',
            mapChildren: 'childNodes',
            original: true
          });
        } // ???????????????


        var cols = [];

        _xeUtils.default.eachTree(groups, function (column) {
          var isColGroup = column.children && column.children.length;

          if (!isColGroup) {
            cols.push(column);
          }
        }, {
          children: 'childNodes'
        }); // ??????????????????


        opts.columns = cols;
        opts.colgroups = convertToRows(groups);

        if (!opts.filename) {
          opts.filename = _conf.default.i18n(opts.original ? 'vxe.table.expOriginFilename' : 'vxe.table.expFilename', [_xeUtils.default.toDateString(Date.now(), 'yyyyMMddHHmmss')]);
        }

        if (!opts.sheetName) {
          opts.sheetName = document.title;
        } // ??????????????????????????????????????????????????????????????????


        if (!opts.exportMethod && !_xeUtils.default.includes(_vXETable.VXETable.config.exportTypes, type)) {
          if (process.env.NODE_ENV === 'development') {
            (0, _utils.errLog)('vxe.error.notType', [type]);
          }

          var params = {
            status: false
          };
          return Promise.reject(params);
        }

        if (!opts.print) {
          if (beforeExportMethod) {
            beforeExportMethod({
              options: opts,
              $table: $xetable,
              $grid: $xegrid
            });
          }
        }

        if (!opts.data) {
          opts.data = afterFullData;

          if (mode === 'selected') {
            var selectRecords_1 = $xetable.getCheckboxRecords();

            if (['html', 'pdf'].indexOf(type) > -1 && treeConfig) {
              opts.data = _xeUtils.default.searchTree($xetable.getTableData().fullData, function (item) {
                return $xetable.findRowIndexOf(selectRecords_1, item) > -1;
              }, Object.assign({}, treeOpts, {
                data: '_row'
              }));
            } else {
              opts.data = selectRecords_1;
            }
          } else if (mode === 'all') {
            if (process.env.NODE_ENV === 'development') {
              if (!$xegrid) {
                (0, _utils.warnLog)('vxe.error.errProp', ['all', 'mode=current,selected']);
              }
            }

            if ($xegrid && !opts.remote) {
              var gridReactData = $xegrid.reactData;
              var computeProxyOpts = $xegrid.getComputeMaps().computeProxyOpts;
              var proxyOpts = computeProxyOpts.value;
              var beforeQueryAll = proxyOpts.beforeQueryAll,
                  afterQueryAll_1 = proxyOpts.afterQueryAll,
                  _a = proxyOpts.ajax,
                  ajax = _a === void 0 ? {} : _a,
                  _b = proxyOpts.props,
                  props_1 = _b === void 0 ? {} : _b;
              var ajaxMethods = ajax.queryAll;

              if (process.env.NODE_ENV === 'development') {
                if (!ajaxMethods) {
                  (0, _utils.warnLog)('vxe.error.notFunc', ['proxy-config.ajax.queryAll']);
                }
              }

              if (ajaxMethods) {
                var params_1 = {
                  $table: $xetable,
                  $grid: $xegrid,
                  sort: gridReactData.sortData,
                  filters: gridReactData.filterData,
                  form: gridReactData.formData,
                  target: ajaxMethods,
                  options: opts
                };
                return Promise.resolve((beforeQueryAll || ajaxMethods)(params_1)).catch(function (e) {
                  return e;
                }).then(function (rest) {
                  opts.data = (props_1.list ? _xeUtils.default.get(rest, props_1.list) : rest) || [];

                  if (afterQueryAll_1) {
                    afterQueryAll_1(params_1);
                  }

                  return handleExport(opts);
                });
              }
            }
          }
        }

        return handleExport(opts);
      },
      importByFile: function importByFile(file, options) {
        var opts = Object.assign({}, options);
        var beforeImportMethod = opts.beforeImportMethod;

        if (beforeImportMethod) {
          beforeImportMethod({
            options: opts,
            $table: $xetable
          });
        }

        return handleFileImport(file, opts);
      },
      importData: function importData(options) {
        var importOpts = computeImportOpts.value;
        var opts = Object.assign({
          types: _vXETable.VXETable.config.importTypes // beforeImportMethod: null,
          // afterImportMethod: null

        }, importOpts, options);
        var beforeImportMethod = opts.beforeImportMethod,
            afterImportMethod = opts.afterImportMethod;

        if (beforeImportMethod) {
          beforeImportMethod({
            options: opts,
            $table: $xetable
          });
        }

        return (0, _util2.readLocalFile)(opts).catch(function (e) {
          if (afterImportMethod) {
            afterImportMethod({
              status: false,
              options: opts,
              $table: $xetable
            });
          }

          return Promise.reject(e);
        }).then(function (params) {
          var file = params.file;
          return handleFileImport(file, opts);
        });
      },
      saveFile: function saveFile(options) {
        return (0, _util2.saveLocalFile)(options);
      },
      readFile: function readFile(options) {
        return (0, _util2.readLocalFile)(options);
      },
      print: function print(options) {
        var printOpts = computePrintOpts.value;
        var opts = Object.assign({
          original: false // beforePrintMethod

        }, printOpts, options, {
          type: 'html',
          download: false,
          remote: false,
          print: true
        });

        if (!opts.sheetName) {
          opts.sheetName = document.title;
        }

        return new Promise(function (resolve) {
          if (opts.content) {
            resolve((0, _util2.handlePrint)($xetable, opts, opts.content));
          } else {
            resolve(exportMethods.exportData(opts).then(function (_a) {
              var content = _a.content;
              return (0, _util2.handlePrint)($xetable, opts, content);
            }));
          }
        });
      },
      openImport: function openImport(options) {
        var treeConfig = props.treeConfig,
            importConfig = props.importConfig;
        var initStore = reactData.initStore,
            importStore = reactData.importStore,
            importParams = reactData.importParams;
        var importOpts = computeImportOpts.value;
        var defOpts = Object.assign({
          mode: 'insert',
          message: true,
          types: _vXETable.VXETable.config.importTypes
        }, options, importOpts);
        var types = defOpts.types;
        var isTree = !!treeConfig;

        if (isTree) {
          if (defOpts.message) {
            _vXETable.VXETable.modal.message({
              content: _conf.default.i18n('vxe.error.treeNotImp'),
              status: 'error'
            });
          }

          return;
        }

        if (!importConfig) {
          (0, _utils.errLog)('vxe.error.reqProp', ['import-config']);
        } // ????????????


        var typeList = types.map(function (value) {
          return {
            value: value,
            label: "vxe.export.types." + value
          };
        });
        var modeList = defOpts.modes.map(function (value) {
          return {
            value: value,
            label: "vxe.import.modes." + value
          };
        });
        Object.assign(importStore, {
          file: null,
          type: '',
          filename: '',
          modeList: modeList,
          typeList: typeList,
          visible: true
        });
        Object.assign(importParams, defOpts);
        initStore.import = true;
      },
      openExport: function openExport(options) {
        var exportOpts = computeExportOpts.value;

        if (process.env.NODE_ENV === 'development') {
          if (!props.exportConfig) {
            (0, _utils.errLog)('vxe.error.reqProp', ['export-config']);
          }
        }

        handleExportAndPrint(Object.assign({}, exportOpts, options));
      },
      openPrint: function openPrint(options) {
        var printOpts = computePrintOpts.value;

        if (process.env.NODE_ENV === 'development') {
          if (!props.printConfig) {
            (0, _utils.errLog)('vxe.error.reqProp', ['print-config']);
          }
        }

        handleExportAndPrint(Object.assign({}, printOpts, options), true);
      }
    };
    return exportMethods;
  },
  setupGrid: function setupGrid($xegrid) {
    return $xegrid.extendTableMethods(tableExportMethodKeys);
  }
};
var _default = tableExportHook;
exports.default = _default;