import { nextTick } from 'vue'
import XEUtils from 'xe-utils'
import { renderer } from '../../v-x-e-table'
import { errLog, getLog, isEnableConf } from '../../tools/utils'
import { getCellValue, setCellValue } from '../../table/src/util'
import { browse, removeClass, addClass } from '../../tools/dom'

import { VxeGlobalHooksHandles, TableEditMethods, TableEditPrivateMethods } from '../../../types/all'

const tableEditMethodKeys: (keyof TableEditMethods)[] = ['insert', 'insertAt', 'remove', 'removeCheckboxRow', 'removeRadioRow', 'removeCurrentRow', 'getRecordset', 'getInsertRecords', 'getRemoveRecords', 'getUpdateRecords', 'getActiveRecord', 'getSelectedCell', 'clearActived', 'clearSelected', 'isActiveByRow', 'setActiveRow', 'setActiveCell', 'setSelectCell']

const editHook: VxeGlobalHooksHandles.HookOptions = {
  setupTable ($xetable) {
    const { props, reactData, internalData } = $xetable
    const { refElem } = $xetable.getRefMaps()
    const { computeMouseOpts, computeEditOpts, computeCheckboxOpts, computeSYOpts, computeTreeOpts } = $xetable.getComputeMaps()

    let editMethods = {} as TableEditMethods
    let editPrivateMethods = {} as TableEditPrivateMethods

    const getEditColumnModel = (row: any, column: any) => {
      const { model, editRender } = column
      if (editRender) {
        model.value = getCellValue(row, column)
        model.update = false
      }
    }

    const setEditColumnModel = (row: any, column: any) => {
      const { model, editRender } = column
      if (editRender && model.update) {
        setCellValue(row, column, model.value)
        model.update = false
        model.value = null
      }
    }

    const removeCellSelectedClass = () => {
      const el = refElem.value
      if (el) {
        const cell = el.querySelector('.col--selected')
        if (cell) {
          removeClass(cell, 'col--selected')
        }
      }
    }

    function syncActivedCell () {
      const { editStore, tableColumn } = reactData
      const editOpts = computeEditOpts.value
      const { actived } = editStore
      const { row, column } = actived
      if (row || column) {
        if (editOpts.mode === 'row') {
          tableColumn.forEach((column: any) => setEditColumnModel(row, column))
        } else {
          setEditColumnModel(row, column)
        }
      }
    }

    editMethods = {
      /**
       * ??????????????????????????????
       *
       * @param {*} records
       */
      insert (records: any) {
        return editMethods.insertAt(records, null)
      },
      /**
       * ???????????????????????????????????????
       * ?????? row ???????????????????????????
       * ?????? row ??? -1 ?????????????????????
       * ?????? row ???????????????????????????????????????
       * @param {Object/Array} records ????????????
       * @param {Row} row ?????????
       */
      insertAt (records: any, row: any) {
        const { treeConfig } = props
        const { mergeList, editStore, scrollYLoad } = reactData
        const { afterFullData, tableFullData } = internalData
        const sYOpts = computeSYOpts.value
        if (!XEUtils.isArray(records)) {
          records = [records]
        }
        const newRecords = records.map((record: any) => $xetable.defineField(Object.assign({}, record)))
        if (!row) {
          afterFullData.unshift(...newRecords)
          tableFullData.unshift(...newRecords)
          // ?????????????????????
          mergeList.forEach((mergeItem: any) => {
            const { row: mergeRowIndex } = mergeItem
            if (mergeRowIndex > 0) {
              mergeItem.row = mergeRowIndex + newRecords.length
            }
          })
        } else {
          if (row === -1) {
            afterFullData.push(...newRecords)
            tableFullData.push(...newRecords)
            // ?????????????????????
            mergeList.forEach((mergeItem: any) => {
              const { row: mergeRowIndex, rowspan: mergeRowspan } = mergeItem
              if (mergeRowIndex + mergeRowspan > afterFullData.length) {
                mergeItem.rowspan = mergeRowspan + newRecords.length
              }
            })
          } else {
            if (treeConfig) {
              throw new Error(getLog('vxe.error.noTree', ['insert']))
            }
            const afIndex = $xetable.findRowIndexOf(afterFullData, row)
            if (afIndex === -1) {
              throw new Error(errLog('vxe.error.unableInsert'))
            }
            afterFullData.splice(afIndex, 0, ...newRecords)
            tableFullData.splice($xetable.findRowIndexOf(tableFullData, row), 0, ...newRecords)
            // ?????????????????????
            mergeList.forEach((mergeItem: any) => {
              const { row: mergeRowIndex, rowspan: mergeRowspan } = mergeItem
              if (mergeRowIndex > afIndex) {
                mergeItem.row = mergeRowIndex + newRecords.length
              } else if (mergeRowIndex + mergeRowspan > afIndex) {
                mergeItem.rowspan = mergeRowspan + newRecords.length
              }
            })
          }
        }
        editStore.insertList.unshift(...newRecords)
        reactData.scrollYLoad = !treeConfig && sYOpts.gt > -1 && sYOpts.gt < tableFullData.length
        $xetable.updateFooter()
        $xetable.updateCache()
        $xetable.handleTableData()
        $xetable.updateAfterDataIndex()
        $xetable.checkSelectionStatus()
        if (scrollYLoad) {
          $xetable.updateScrollYSpace()
        }
        return nextTick().then(() => {
          $xetable.updateCellAreas()
          return $xetable.recalculate()
        }).then(() => {
          return {
            row: newRecords.length ? newRecords[newRecords.length - 1] : null,
            rows: newRecords
          }
        })
      },
      /**
       * ?????????????????????
       * ????????? row ???????????????
       * ????????? rows ???????????????
       * ???????????????????????????
       */
      remove (rows: any) {
        const { treeConfig } = props
        const { mergeList, editStore, selection, scrollYLoad } = reactData
        const { afterFullData, tableFullData } = internalData
        const checkboxOpts = computeCheckboxOpts.value
        const sYOpts = computeSYOpts.value
        const { actived, removeList, insertList } = editStore
        const { checkField: property } = checkboxOpts
        let rest: any[] = []
        if (!rows) {
          rows = tableFullData
        } else if (!XEUtils.isArray(rows)) {
          rows = [rows]
        }
        // ?????????????????????????????????
        rows.forEach((row: any) => {
          if (!$xetable.isInsertByRow(row)) {
            removeList.push(row)
          }
        })
        // ?????????????????????????????????????????????
        if (!property) {
          rows.forEach((row: any) => {
            const sIndex = $xetable.findRowIndexOf(selection, row)
            if (sIndex > -1) {
              selection.splice(sIndex, 1)
            }
          })
        }
        // ?????????????????????
        if (tableFullData === rows) {
          rows = rest = tableFullData.slice(0)
          internalData.tableFullData = []
          internalData.afterFullData = []
          $xetable.clearMergeCells()
        } else {
          rows.forEach((row: any) => {
            const tfIndex = $xetable.findRowIndexOf(tableFullData, row)
            if (tfIndex > -1) {
              const rItems = tableFullData.splice(tfIndex, 1)
              rest.push(rItems[0])
            }
            const afIndex = $xetable.findRowIndexOf(afterFullData, row)
            if (afIndex > -1) {
              // ?????????????????????
              mergeList.forEach((mergeItem: any) => {
                const { row: mergeRowIndex, rowspan: mergeRowspan } = mergeItem
                if (mergeRowIndex > afIndex) {
                  mergeItem.row = mergeRowIndex - 1
                } else if (mergeRowIndex + mergeRowspan > afIndex) {
                  mergeItem.rowspan = mergeRowspan - 1
                }
              })
              afterFullData.splice(afIndex, 1)
            }
          })
        }
        // ??????????????????????????????????????????????????????
        if (actived.row && $xetable.findRowIndexOf(rows, actived.row) > -1) {
          editMethods.clearActived()
        }
        // ????????????????????????????????????
        rows.forEach((row: any) => {
          const iIndex = $xetable.findRowIndexOf(insertList, row)
          if (iIndex > -1) {
            insertList.splice(iIndex, 1)
          }
        })
        reactData.scrollYLoad = !treeConfig && sYOpts.gt > -1 && sYOpts.gt < tableFullData.length
        $xetable.updateFooter()
        $xetable.updateCache()
        $xetable.handleTableData()
        $xetable.updateAfterDataIndex()
        $xetable.checkSelectionStatus()
        if (scrollYLoad) {
          $xetable.updateScrollYSpace()
        }
        return nextTick().then(() => {
          $xetable.updateCellAreas()
          return $xetable.recalculate()
        }).then(() => {
          return { row: rest.length ? rest[rest.length - 1] : null, rows: rest }
        })
      },
      /**
       * ??????????????????????????????
       */
      removeCheckboxRow () {
        return editMethods.remove($xetable.getCheckboxRecords()).then((params: any) => {
          $xetable.clearCheckboxRow()
          return params
        })
      },
      /**
       * ??????????????????????????????
       */
      removeRadioRow () {
        const radioRecord = $xetable.getRadioRecord()
        return editMethods.remove(radioRecord || []).then((params: any) => {
          $xetable.clearRadioRow()
          return params
        })
      },
      /**
       * ??????????????????????????????
       */
      removeCurrentRow () {
        const currentRecord = $xetable.getCurrentRecord()
        return editMethods.remove(currentRecord || []).then((params: any) => {
          $xetable.clearCurrentRow()
          return params
        })
      },
      /**
       * ??????????????????????????????????????????????????????
       */
      getRecordset () {
        return {
          insertRecords: editMethods.getInsertRecords(),
          removeRecords: editMethods.getRemoveRecords(),
          updateRecords: editMethods.getUpdateRecords()
        }
      },
      /**
       * ???????????????????????????
       */
      getInsertRecords () {
        const { editStore } = reactData
        const { tableFullData } = internalData
        const insertList = editStore.insertList
        const insertRecords: any[] = []
        if (insertList.length) {
          tableFullData.forEach((row: any) => {
            if ($xetable.findRowIndexOf(insertList, row) > -1) {
              insertRecords.push(row)
            }
          })
        }
        return insertRecords
      },
      /**
       * ????????????????????????
       */
      getRemoveRecords () {
        const { editStore } = reactData
        return editStore.removeList
      },
      /**
       * ??????????????????
       * ??????????????? row ?????????
       * ??????????????????????????????????????????????????????????????????????????????
       */
      getUpdateRecords () {
        const { keepSource, treeConfig } = props
        const { tableFullData } = internalData
        const treeOpts = computeTreeOpts.value
        if (keepSource) {
          syncActivedCell()
          if (treeConfig) {
            return XEUtils.filterTree(tableFullData, row => $xetable.isUpdateByRow(row), treeOpts)
          }
          return tableFullData.filter((row: any) => $xetable.isUpdateByRow(row))
        }
        return []
      },
      getActiveRecord () {
        const { editStore } = reactData
        const { afterFullData } = internalData
        const el = refElem.value
        const { args, row } = editStore.actived
        if (args && $xetable.findRowIndexOf(afterFullData, row) > -1 && el.querySelectorAll('.vxe-body--column.col--actived').length) {
          return Object.assign({}, args)
        }
        return null
      },
      /**
       * ????????????????????????
       */
      getSelectedCell () {
        const { editStore } = reactData
        const { args, column } = editStore.selected
        if (args && column) {
          return Object.assign({}, args)
        }
        return null
      },
      /**
       * ?????????????????????
       */
      clearActived (evnt) {
        const { editStore } = reactData
        const { actived } = editStore
        const { row, column } = actived
        if (row || column) {
          syncActivedCell()
          actived.args = null
          actived.row = null
          actived.column = null
          $xetable.updateFooter()
          $xetable.dispatchEvent('edit-closed', {
            row,
            rowIndex: $xetable.getRowIndex(row),
            $rowIndex: $xetable.getVMRowIndex(row),
            column,
            columnIndex: $xetable.getColumnIndex(column),
            $columnIndex: $xetable.getVMColumnIndex(column)
          }, evnt || null)
        }
        return ($xetable.clearValidate ? $xetable.clearValidate() : nextTick()).then(() => $xetable.recalculate())
      },
      /**
       * ????????????????????????
       */
      clearSelected () {
        const { editStore } = reactData
        const { selected } = editStore
        selected.row = null
        selected.column = null
        removeCellSelectedClass()
        return nextTick()
      },
      /**
       * ????????????????????????????????????
       * @param {Row} row ?????????
       */
      isActiveByRow (row) {
        const { editStore } = reactData
        return editStore.actived.row === row
      },
      /**
       * ???????????????
       */
      setActiveRow (row) {
        const { visibleColumn } = internalData
        return $xetable.setActiveCell(row, XEUtils.find(visibleColumn, column => isEnableConf(column.editRender)))
      },
      /**
       * ?????????????????????
       */
      setActiveCell (row, fieldOrColumn) {
        const { editConfig } = props
        const column = XEUtils.isString(fieldOrColumn) ? $xetable.getColumnByField(fieldOrColumn) : fieldOrColumn
        if (row && column && isEnableConf(editConfig) && isEnableConf(column.editRender)) {
          return $xetable.scrollToRow(row, column).then(() => {
            const cell = $xetable.getCell(row, column)
            if (cell) {
              editPrivateMethods.handleActived({ row, rowIndex: $xetable.getRowIndex(row), column, columnIndex: $xetable.getColumnIndex(column), cell, $table: $xetable })
              internalData._lastCallTime = Date.now()
            }
            return nextTick()
          })
        }
        return nextTick()
      },
      /**
       * ?????? trigger=dblclick ????????????????????????
       */
      setSelectCell (row, fieldOrColumn) {
        const { tableData } = reactData
        const { visibleColumn } = internalData
        const editOpts = computeEditOpts.value
        const column = XEUtils.isString(fieldOrColumn) ? $xetable.getColumnByField(fieldOrColumn) : fieldOrColumn
        if (row && column && editOpts.trigger !== 'manual') {
          const rowIndex = $xetable.findRowIndexOf(tableData, row)
          if (rowIndex > -1 && column) {
            const cell = $xetable.getCell(row, column)
            const params = { row, rowIndex, column, columnIndex: visibleColumn.indexOf(column), cell }
            $xetable.handleSelected(params, {})
          }
        }
        return nextTick()
      }
    }

    editPrivateMethods = {
      /**
       * ??????????????????
       */
      handleActived (params, evnt) {
        const { editConfig, mouseConfig } = props
        const { editStore, tableColumn } = reactData
        const editOpts = computeEditOpts.value
        const { mode, activeMethod } = editOpts
        const { actived } = editStore
        const { row, column } = params
        const { editRender } = column
        const cell = params.cell = (params.cell || $xetable.getCell(row, column))
        if (isEnableConf(editConfig) && isEnableConf(editRender) && cell) {
          if (actived.row !== row || (mode === 'cell' ? actived.column !== column : false)) {
            // ????????????????????????
            let type: 'edit-disabled' | 'edit-actived' = 'edit-disabled'
            if (!activeMethod || activeMethod(params)) {
              if (mouseConfig) {
                editMethods.clearSelected()
                if ($xetable.clearCellAreas) {
                  $xetable.clearCellAreas()
                  $xetable.clearCopyCellArea()
                }
              }
              $xetable.closeTooltip()
              editMethods.clearActived(evnt)
              type = 'edit-actived'
              column.renderHeight = cell.offsetHeight
              actived.args = params
              actived.row = row
              actived.column = column
              if (mode === 'row') {
                tableColumn.forEach((column: any) => getEditColumnModel(row, column))
              } else {
                getEditColumnModel(row, column)
              }
              nextTick(() => {
                editPrivateMethods.handleFocus(params, evnt)
              })
            }
            $xetable.dispatchEvent(type, {
              row,
              rowIndex: $xetable.getRowIndex(row),
              $rowIndex: $xetable.getVMRowIndex(row),
              column,
              columnIndex: $xetable.getColumnIndex(column),
              $columnIndex: $xetable.getVMColumnIndex(column)
            }, evnt)
          } else {
            const { column: oldColumn } = actived
            if (mouseConfig) {
              editMethods.clearSelected()
              if ($xetable.clearCellAreas) {
                $xetable.clearCellAreas()
                $xetable.clearCopyCellArea()
              }
            }
            if (oldColumn !== column) {
              const { model: oldModel } = oldColumn
              if (oldModel.update) {
                setCellValue(row, oldColumn, oldModel.value)
              }
              if ($xetable.clearValidate) {
                $xetable.clearValidate()
              }
            }
            column.renderHeight = cell.offsetHeight
            actived.args = params
            actived.column = column
            setTimeout(() => {
              editPrivateMethods.handleFocus(params, evnt)
            })
          }
          $xetable.focus()
        }
        return nextTick()
      },
      /**
       * ????????????
       */
      handleFocus (params) {
        const { row, column, cell } = params
        const { editRender } = column
        if (isEnableConf(editRender)) {
          const compRender = renderer.get(editRender.name)
          const { autofocus, autoselect } = editRender
          let inputElem
          // ????????????????????? class
          if (autofocus) {
            inputElem = cell.querySelector(autofocus)
          }
          // ????????????????????????
          if (!inputElem && compRender && compRender.autofocus) {
            inputElem = cell.querySelector(compRender.autofocus)
          }
          if (inputElem) {
            inputElem.focus()
            if (autoselect) {
              inputElem.select()
            } else {
              // ???????????????????????????????????????
              if (browse.msie) {
                const textRange = inputElem.createTextRange()
                textRange.collapse(false)
                textRange.select()
              }
            }
          } else {
            // ?????????????????????
            $xetable.scrollToRow(row, column)
          }
        }
      },
      /**
       * ???????????????
       */
      handleSelected (params, evnt) {
        const { mouseConfig } = props
        const { editStore } = reactData
        const mouseOpts = computeMouseOpts.value
        const editOpts = computeEditOpts.value
        const { actived, selected } = editStore
        const { row, column } = params
        const isMouseSelected = mouseConfig && mouseOpts.selected
        const selectMethod = () => {
          if (isMouseSelected && (selected.row !== row || selected.column !== column)) {
            if (actived.row !== row || (editOpts.mode === 'cell' ? actived.column !== column : false)) {
              editMethods.clearActived(evnt)
              editMethods.clearSelected()
              if ($xetable.clearCellAreas) {
                $xetable.clearCellAreas()
                $xetable.clearCopyCellArea()
              }
              selected.args = params
              selected.row = row
              selected.column = column
              if (isMouseSelected) {
                editPrivateMethods.addCellSelectedClass()
              }
              $xetable.focus()
            }
          }
          return nextTick()
        }
        return selectMethod()
      },
      addCellSelectedClass () {
        const { editStore } = reactData
        const { selected } = editStore
        const { row, column } = selected
        removeCellSelectedClass()
        if (row && column) {
          const cell = $xetable.getCell(row, column)
          if (cell) {
            addClass(cell, 'col--selected')
          }
        }
      }
    }

    return { ...editMethods, ...editPrivateMethods }
  },
  setupGrid ($xegrid) {
    return $xegrid.extendTableMethods(tableEditMethodKeys)
  }
}

export default editHook
