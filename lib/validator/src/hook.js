"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _vue = require("vue");

var _xeUtils = _interopRequireDefault(require("xe-utils"));

var _utils = require("../../tools/utils");

var _dom = require("../../tools/dom");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __assign = void 0 && (void 0).__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

/**
 * 校验规则
 */
var Rule =
/** @class */
function () {
  function Rule(rule) {
    Object.assign(this, {
      $options: rule,
      required: rule.required,
      min: rule.min,
      max: rule.max,
      type: rule.type,
      pattern: rule.pattern,
      validator: rule.validator,
      trigger: rule.trigger,
      maxWidth: rule.maxWidth
    });
  }

  Object.defineProperty(Rule.prototype, "message", {
    /**
     * 获取校验不通过的消息
     * 支持国际化翻译
     */
    get: function get() {
      return (0, _utils.getFuncText)(this.$options.message);
    },
    enumerable: false,
    configurable: true
  });
  return Rule;
}();

var tableValidatorMethodKeys = ['fullValidate', 'validate', 'clearValidate'];
var validatorHook = {
  setupTable: function setupTable($xetable) {
    var props = $xetable.props,
        reactData = $xetable.reactData,
        internalData = $xetable.internalData;
    var refValidTooltip = $xetable.getRefMaps().refValidTooltip;

    var _a = $xetable.getComputeMaps(),
        computeValidOpts = _a.computeValidOpts,
        computeTreeOpts = _a.computeTreeOpts,
        computeEditOpts = _a.computeEditOpts;

    var validatorMethods = {};
    var validatorPrivateMethods = {};
    var validRuleErr;
    /**
     * 聚焦到校验通过的单元格并弹出校验错误提示
     */

    var handleValidError = function handleValidError(params) {
      return new Promise(function (resolve) {
        var validOpts = computeValidOpts.value;

        if (validOpts.autoPos === false) {
          $xetable.dispatchEvent('valid-error', params, null);
          resolve();
        } else {
          $xetable.handleActived(params, {
            type: 'valid-error',
            trigger: 'call'
          }).then(function () {
            setTimeout(function () {
              resolve(validatorPrivateMethods.showValidTooltip(params));
            }, 10);
          });
        }
      });
    };
    /**
     * 对表格数据进行校验
     * 如果不指定数据，则默认只校验临时变动的数据，例如新增或修改
     * 如果传 true 则校验当前表格数据
     * 如果传 row 指定行记录，则只验证传入的行
     * 如果传 rows 为多行记录，则只验证传入的行
     * 如果只传 callback 否则默认验证整个表格数据
     * 返回 Promise 对象，或者使用回调方式
     */


    var beginValidate = function beginValidate(rows, cb, isFull) {
      var validRest = {};
      var editRules = props.editRules,
          treeConfig = props.treeConfig;
      var afterFullData = internalData.afterFullData;
      var treeOpts = computeTreeOpts.value;
      var validOpts = computeValidOpts.value;
      var vaildDatas;

      if (rows === true) {
        vaildDatas = afterFullData;
      } else if (rows) {
        if (_xeUtils.default.isFunction(rows)) {
          cb = rows;
        } else {
          vaildDatas = _xeUtils.default.isArray(rows) ? rows : [rows];
        }
      }

      if (!vaildDatas) {
        if ($xetable.getInsertRecords) {
          vaildDatas = $xetable.getInsertRecords().concat($xetable.getUpdateRecords());
        } else {
          vaildDatas = [];
        }
      }

      var rowValids = [];
      internalData._lastCallTime = Date.now();
      validRuleErr = false; // 如果为快速校验，当存在某列校验不通过时将终止执行

      validatorMethods.clearValidate();

      if (editRules) {
        var columns_1 = $xetable.getColumns();

        var handleVaild = function handleVaild(row) {
          if (isFull || !validRuleErr) {
            var colVailds_1 = [];
            columns_1.forEach(function (column) {
              if ((isFull || !validRuleErr) && _xeUtils.default.has(editRules, column.property)) {
                colVailds_1.push(validatorPrivateMethods.validCellRules('all', row, column).catch(function (_a) {
                  var rule = _a.rule,
                      rules = _a.rules;
                  var rest = {
                    rule: rule,
                    rules: rules,
                    rowIndex: $xetable.getRowIndex(row),
                    row: row,
                    columnIndex: $xetable.getColumnIndex(column),
                    column: column,
                    $table: $xetable
                  };

                  if (!validRest[column.property]) {
                    validRest[column.property] = [];
                  }

                  validRest[column.property].push(rest);

                  if (!isFull) {
                    validRuleErr = true;
                    return Promise.reject(rest);
                  }
                }));
              }
            });
            rowValids.push(Promise.all(colVailds_1));
          }
        };

        if (treeConfig) {
          _xeUtils.default.eachTree(vaildDatas, handleVaild, treeOpts);
        } else {
          vaildDatas.forEach(handleVaild);
        }

        return Promise.all(rowValids).then(function () {
          var ruleProps = Object.keys(validRest);
          return (0, _vue.nextTick)().then(function () {
            if (ruleProps.length) {
              return Promise.reject(validRest[ruleProps[0]][0]);
            }

            if (cb) {
              cb();
            }
          });
        }).catch(function (firstErrParams) {
          return new Promise(function (resolve, reject) {
            var finish = function finish() {
              (0, _vue.nextTick)(function () {
                if (cb) {
                  cb(validRest);
                  resolve();
                } else {
                  reject(validRest);
                }
              });
            };

            var posAndFinish = function posAndFinish() {
              firstErrParams.cell = $xetable.getCell(firstErrParams.row, firstErrParams.column);
              (0, _dom.scrollToView)(firstErrParams.cell);
              handleValidError(firstErrParams).then(finish);
            };
            /**
             * 当校验不通过时
             * 将表格滚动到可视区
             * 由于提示信息至少需要占一行，定位向上偏移一行
             */


            var row = firstErrParams.row;
            var rowIndex = afterFullData.indexOf(row);
            var locatRow = rowIndex > 0 ? afterFullData[rowIndex - 1] : row;

            if (validOpts.autoPos === false) {
              finish();
            } else {
              if (treeConfig) {
                $xetable.scrollToTreeRow(locatRow).then(posAndFinish);
              } else {
                $xetable.scrollToRow(locatRow).then(posAndFinish);
              }
            }
          });
        });
      }

      return (0, _vue.nextTick)().then(function () {
        if (cb) {
          cb();
        }
      });
    };

    validatorMethods = {
      /**
       * 完整校验，和 validate 的区别就是会给有效数据中的每一行进行校验
       */
      fullValidate: function fullValidate(rows, cb) {
        return beginValidate(rows, cb, true);
      },

      /**
       * 快速校验，如果存在记录不通过的记录，则返回不再继续校验（异步校验除外）
       */
      validate: function validate(rows, cb) {
        return beginValidate(rows, cb);
      },
      clearValidate: function clearValidate() {
        var validStore = reactData.validStore;
        var validTip = refValidTooltip.value;
        Object.assign(validStore, {
          visible: false,
          row: null,
          column: null,
          content: '',
          rule: null
        });

        if (validTip && validTip.reactData.visible) {
          validTip.close();
        }

        return (0, _vue.nextTick)();
      }
    };

    var validErrorRuleValue = function validErrorRuleValue(rule, val) {
      var type = rule.type,
          min = rule.min,
          max = rule.max,
          pattern = rule.pattern;
      var isNumType = type === 'number';
      var numVal = isNumType ? _xeUtils.default.toNumber(val) : _xeUtils.default.getSize(val); // 判断数值

      if (isNumType && isNaN(val)) {
        return true;
      } // 如果存在 min，判断最小值


      if (!_xeUtils.default.eqNull(min) && numVal < _xeUtils.default.toNumber(min)) {
        return true;
      } // 如果存在 max，判断最大值


      if (!_xeUtils.default.eqNull(max) && numVal > _xeUtils.default.toNumber(max)) {
        return true;
      } // 如果存在 pattern，正则校验


      if (pattern && !(_xeUtils.default.isRegExp(pattern) ? pattern : new RegExp(pattern)).test(val)) {
        return true;
      }

      return false;
    };

    validatorPrivateMethods = {
      /**
       * 校验数据
       * 按表格行、列顺序依次校验（同步或异步）
       * 校验规则根据索引顺序依次校验，如果是异步则会等待校验完成才会继续校验下一列
       * 如果校验失败则，触发回调或者Promise<不通过列的错误消息>
       * 如果是传回调方式这返回一个校验不通过列的错误消息
       *
       * rule 配置：
       *  required=Boolean 是否必填
       *  min=Number 最小长度
       *  max=Number 最大长度
       *  validator=Function({ cellValue, rule, rules, row, column, rowIndex, columnIndex }) 自定义校验，接收一个 Promise
       *  trigger=blur|change 触发方式（除非特殊场景，否则默认为空就行）
       */
      validCellRules: function validCellRules(validType, row, column, val) {
        var editRules = props.editRules;
        var property = column.property;
        var errorRules = [];
        var syncVailds = [];

        if (property && editRules) {
          var rules_1 = _xeUtils.default.get(editRules, property);

          if (rules_1) {
            var cellValue_1 = _xeUtils.default.isUndefined(val) ? _xeUtils.default.get(row, property) : val;
            rules_1.forEach(function (rule) {
              var type = rule.type,
                  trigger = rule.trigger,
                  required = rule.required;

              if (validType === 'all' || !trigger || validType === trigger) {
                if (_xeUtils.default.isFunction(rule.validator)) {
                  var customValid = rule.validator({
                    cellValue: cellValue_1,
                    rule: rule,
                    rules: rules_1,
                    row: row,
                    rowIndex: $xetable.getRowIndex(row),
                    column: column,
                    columnIndex: $xetable.getColumnIndex(column),
                    $table: $xetable
                  });

                  if (customValid) {
                    if (_xeUtils.default.isError(customValid)) {
                      validRuleErr = true;
                      errorRules.push(new Rule({
                        type: 'custom',
                        trigger: trigger,
                        message: customValid.message,
                        rule: new Rule(rule)
                      }));
                    } else if (customValid.catch) {
                      // 如果为异步校验（注：异步校验是并发无序的）
                      syncVailds.push(customValid.catch(function (e) {
                        validRuleErr = true;
                        errorRules.push(new Rule({
                          type: 'custom',
                          trigger: trigger,
                          message: e && e.message ? e.message : rule.message,
                          rule: new Rule(rule)
                        }));
                      }));
                    }
                  }
                } else {
                  var isArrType = type === 'array';
                  var hasEmpty = isArrType ? !_xeUtils.default.isArray(cellValue_1) || !cellValue_1.length : (0, _utils.eqEmptyValue)(cellValue_1);

                  if (required ? hasEmpty || validErrorRuleValue(rule, cellValue_1) : !hasEmpty && validErrorRuleValue(rule, cellValue_1)) {
                    validRuleErr = true;
                    errorRules.push(new Rule(rule));
                  }
                }
              }
            });
          }
        }

        return Promise.all(syncVailds).then(function () {
          if (errorRules.length) {
            var rest = {
              rules: errorRules,
              rule: errorRules[0]
            };
            return Promise.reject(rest);
          }
        });
      },
      hasCellRules: function hasCellRules(type, row, column) {
        var editRules = props.editRules;
        var property = column.property;

        if (property && editRules) {
          var rules = _xeUtils.default.get(editRules, property);

          return rules && !!_xeUtils.default.find(rules, function (rule) {
            return type === 'all' || !rule.trigger || type === rule.trigger;
          });
        }

        return false;
      },

      /**
       * 触发校验
       */
      triggerValidate: function triggerValidate(type) {
        var editConfig = props.editConfig,
            editRules = props.editRules;
        var editStore = reactData.editStore,
            validStore = reactData.validStore;
        var actived = editStore.actived;
        var editOpts = computeEditOpts.value;

        if (editConfig && editRules && actived.row) {
          var _a = actived.args,
              row_1 = _a.row,
              column_1 = _a.column,
              cell_1 = _a.cell;

          if (validatorPrivateMethods.hasCellRules(type, row_1, column_1)) {
            return validatorPrivateMethods.validCellRules(type, row_1, column_1).then(function () {
              if (editOpts.mode === 'row') {
                if (validStore.visible && validStore.row === row_1 && validStore.column === column_1) {
                  validatorMethods.clearValidate();
                }
              }
            }).catch(function (_a) {
              var rule = _a.rule; // 如果校验不通过与触发方式一致，则聚焦提示错误，否则跳过并不作任何处理

              if (!rule.trigger || type === rule.trigger) {
                var rest = {
                  rule: rule,
                  row: row_1,
                  column: column_1,
                  cell: cell_1
                };
                validatorPrivateMethods.showValidTooltip(rest);
                return Promise.reject(rest);
              }

              return Promise.resolve();
            });
          }
        }

        return Promise.resolve();
      },

      /**
       * 弹出校验错误提示
       */
      showValidTooltip: function showValidTooltip(params) {
        var height = props.height;
        var tableData = reactData.tableData,
            validStore = reactData.validStore;
        var validOpts = computeValidOpts.value;
        var rule = params.rule,
            row = params.row,
            column = params.column,
            cell = params.cell;
        var validTip = refValidTooltip.value;
        var content = rule.message;
        return (0, _vue.nextTick)().then(function () {
          Object.assign(validStore, {
            row: row,
            column: column,
            rule: rule,
            content: content,
            visible: true
          });
          $xetable.dispatchEvent('valid-error', params, null);

          if (validTip && (validOpts.message === 'tooltip' || validOpts.message === 'default' && !height && tableData.length < 2)) {
            return validTip.open(cell, content);
          }
        });
      }
    };
    return __assign(__assign({}, validatorMethods), validatorPrivateMethods);
  },
  setupGrid: function setupGrid($xegrid) {
    return $xegrid.extendTableMethods(tableValidatorMethodKeys);
  }
};
var _default = validatorHook;
exports.default = _default;