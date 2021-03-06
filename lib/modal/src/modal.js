"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.msgQueue = exports.default = exports.allActivedModals = void 0;

var _vue = require("vue");

var _xeUtils = _interopRequireDefault(require("xe-utils"));

var _size = require("../../hooks/size");

var _dom = require("../../tools/dom");

var _utils = require("../../tools/utils");

var _event = require("../../tools/event");

var _conf = _interopRequireDefault(require("../../v-x-e-table/src/conf"));

var _button = _interopRequireDefault(require("../../button/src/button"));

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

var allActivedModals = [];
exports.allActivedModals = allActivedModals;
var msgQueue = [];
exports.msgQueue = msgQueue;

var _default2 = (0, _vue.defineComponent)({
  name: 'VxeModal',
  props: {
    modelValue: Boolean,
    id: String,
    type: {
      type: String,
      default: 'modal'
    },
    loading: {
      type: Boolean,
      default: null
    },
    status: String,
    iconStatus: String,
    className: String,
    top: {
      type: [Number, String],
      default: function _default() {
        return _conf.default.modal.top;
      }
    },
    position: [String, Object],
    title: String,
    duration: {
      type: [Number, String],
      default: function _default() {
        return _conf.default.modal.duration;
      }
    },
    message: [Number, String],
    content: [Number, String],
    cancelButtonText: {
      type: String,
      default: function _default() {
        return _conf.default.modal.cancelButtonText;
      }
    },
    confirmButtonText: {
      type: String,
      default: function _default() {
        return _conf.default.modal.confirmButtonText;
      }
    },
    lockView: {
      type: Boolean,
      default: function _default() {
        return _conf.default.modal.lockView;
      }
    },
    lockScroll: Boolean,
    mask: {
      type: Boolean,
      default: function _default() {
        return _conf.default.modal.mask;
      }
    },
    maskClosable: {
      type: Boolean,
      default: function _default() {
        return _conf.default.modal.maskClosable;
      }
    },
    escClosable: {
      type: Boolean,
      default: function _default() {
        return _conf.default.modal.escClosable;
      }
    },
    resize: Boolean,
    showHeader: {
      type: Boolean,
      default: function _default() {
        return _conf.default.modal.showHeader;
      }
    },
    showFooter: {
      type: Boolean,
      default: function _default() {
        return _conf.default.modal.showFooter;
      }
    },
    showZoom: Boolean,
    showClose: {
      type: Boolean,
      default: function _default() {
        return _conf.default.modal.showClose;
      }
    },
    dblclickZoom: {
      type: Boolean,
      default: function _default() {
        return _conf.default.modal.dblclickZoom;
      }
    },
    width: [Number, String],
    height: [Number, String],
    minWidth: {
      type: [Number, String],
      default: function _default() {
        return _conf.default.modal.minWidth;
      }
    },
    minHeight: {
      type: [Number, String],
      default: function _default() {
        return _conf.default.modal.minHeight;
      }
    },
    zIndex: Number,
    marginSize: {
      type: [Number, String],
      default: function _default() {
        return _conf.default.modal.marginSize;
      }
    },
    fullscreen: Boolean,
    draggable: {
      type: Boolean,
      default: function _default() {
        return _conf.default.modal.draggable;
      }
    },
    remember: {
      type: Boolean,
      default: function _default() {
        return _conf.default.modal.remember;
      }
    },
    destroyOnClose: {
      type: Boolean,
      default: function _default() {
        return _conf.default.modal.destroyOnClose;
      }
    },
    showTitleOverflow: {
      type: Boolean,
      default: function _default() {
        return _conf.default.modal.showTitleOverflow;
      }
    },
    transfer: {
      type: Boolean,
      default: function _default() {
        return _conf.default.modal.transfer;
      }
    },
    storage: {
      type: Boolean,
      default: function _default() {
        return _conf.default.modal.storage;
      }
    },
    storageKey: {
      type: String,
      default: function _default() {
        return _conf.default.modal.storageKey;
      }
    },
    animat: {
      type: Boolean,
      default: function _default() {
        return _conf.default.modal.animat;
      }
    },
    size: {
      type: String,
      default: function _default() {
        return _conf.default.modal.size || _conf.default.size;
      }
    },
    beforeHideMethod: {
      type: Function,
      default: function _default() {
        return _conf.default.modal.beforeHideMethod;
      }
    },
    slots: Object
  },
  emits: ['update:modelValue', 'show', 'hide', 'before-hide', 'close', 'confirm', 'cancel', 'zoom'],
  setup: function setup(props, context) {
    var slots = context.slots,
        emit = context.emit;

    var xID = _xeUtils.default.uniqueId();

    var computeSize = (0, _size.useSize)(props);
    var reactData = (0, _vue.reactive)({
      inited: false,
      visible: false,
      contentVisible: false,
      modalTop: 0,
      modalZindex: 0,
      zoomLocat: null,
      firstOpen: false
    });
    var refElem = (0, _vue.ref)();
    var refModalBox = (0, _vue.ref)();
    var refConfirmBtn = (0, _vue.ref)();
    var refCancelBtn = (0, _vue.ref)();
    var refMaps = {
      refElem: refElem
    };
    var $xemodal = {
      xID: xID,
      props: props,
      context: context,
      reactData: reactData,
      getRefMaps: function getRefMaps() {
        return refMaps;
      }
    };
    var modalMethods = {};
    var computeIsMsg = (0, _vue.computed)(function () {
      return props.type === 'message';
    });

    var getBox = function getBox() {
      var boxElem = refModalBox.value;
      return boxElem;
    };

    var recalculate = function recalculate() {
      var width = props.width,
          height = props.height;
      var boxElem = getBox();
      boxElem.style.width = "" + (width ? isNaN(width) ? width : width + "px" : '');
      boxElem.style.height = "" + (height ? isNaN(height) ? height : height + "px" : '');
      return (0, _vue.nextTick)();
    };

    var updateZindex = function updateZindex() {
      var zIndex = props.zIndex;
      var modalZindex = reactData.modalZindex;

      if (zIndex) {
        reactData.modalZindex = zIndex;
      } else if (modalZindex < (0, _utils.getLastZIndex)()) {
        reactData.modalZindex = (0, _utils.nextZIndex)();
      }
    };

    var updatePosition = function updatePosition() {
      return (0, _vue.nextTick)().then(function () {
        var position = props.position;

        var marginSize = _xeUtils.default.toNumber(props.marginSize);

        var boxElem = getBox();
        var clientVisibleWidth = document.documentElement.clientWidth || document.body.clientWidth;
        var clientVisibleHeight = document.documentElement.clientHeight || document.body.clientHeight;
        var isPosCenter = position === 'center';

        var _a = _xeUtils.default.isString(position) ? {
          top: position,
          left: position
        } : Object.assign({}, position),
            top = _a.top,
            left = _a.left;

        var topCenter = isPosCenter || top === 'center';
        var leftCenter = isPosCenter || left === 'center';
        var posTop = '';
        var posLeft = '';

        if (left && !leftCenter) {
          posLeft = isNaN(left) ? left : left + "px";
        } else {
          posLeft = Math.max(marginSize, clientVisibleWidth / 2 - boxElem.offsetWidth / 2) + "px";
        }

        if (top && !topCenter) {
          posTop = isNaN(top) ? top : top + "px";
        } else {
          posTop = Math.max(marginSize, clientVisibleHeight / 2 - boxElem.offsetHeight / 2) + "px";
        }

        boxElem.style.top = posTop;
        boxElem.style.left = posLeft;
      });
    };

    var updateStyle = function updateStyle() {
      (0, _vue.nextTick)(function () {
        var offsetTop = 0;
        msgQueue.forEach(function (comp) {
          var boxElem = comp.getBox();
          offsetTop += _xeUtils.default.toNumber(comp.props.top);
          comp.reactData.modalTop = offsetTop;
          offsetTop += boxElem.clientHeight;
        });
      });
    };

    var removeMsgQueue = function removeMsgQueue() {
      if (msgQueue.indexOf($xemodal) > -1) {
        _xeUtils.default.remove(msgQueue, function (comp) {
          return comp === $xemodal;
        });
      }

      updateStyle();
    };

    var closeModal = function closeModal(type) {
      var remember = props.remember,
          beforeHideMethod = props.beforeHideMethod;
      var visible = reactData.visible;
      var isMsg = computeIsMsg.value;
      var params = {
        type: type
      };

      if (visible) {
        Promise.resolve(beforeHideMethod ? beforeHideMethod(params) : null).then(function (rest) {
          if (!_xeUtils.default.isError(rest)) {
            if (isMsg) {
              removeMsgQueue();
            }

            reactData.contentVisible = false;

            if (!remember) {
              reactData.zoomLocat = null;
            }

            _xeUtils.default.remove(allActivedModals, function (item) {
              return item === $xemodal;
            });

            modalMethods.dispatchEvent('before-hide', params);
            setTimeout(function () {
              reactData.visible = false;
              emit('update:modelValue', false);
              modalMethods.dispatchEvent('hide', params);
            }, 200);
          }
        }).catch(function (e) {
          return e;
        });
      }

      return (0, _vue.nextTick)();
    };

    var closeEvent = function closeEvent(evnt) {
      var type = 'close';
      modalMethods.dispatchEvent(type, {
        type: type
      }, evnt);
      closeModal(type);
    };

    var confirmEvent = function confirmEvent(evnt) {
      var type = 'confirm';
      modalMethods.dispatchEvent(type, {
        type: type
      }, evnt);
      closeModal(type);
    };

    var cancelEvent = function cancelEvent(evnt) {
      var type = 'cancel';
      modalMethods.dispatchEvent(type, {
        type: type
      }, evnt);
      closeModal(type);
    };

    var getStorageMap = function getStorageMap(key) {
      var version = _conf.default.version;

      var rest = _xeUtils.default.toStringJSON(localStorage.getItem(key) || '');

      return rest && rest._v === version ? rest : {
        _v: version
      };
    };

    var hasPosStorage = function hasPosStorage() {
      var id = props.id,
          remember = props.remember,
          storage = props.storage,
          storageKey = props.storageKey;
      return !!(id && remember && storage && getStorageMap(storageKey)[id]);
    };

    var restorePosStorage = function restorePosStorage() {
      var id = props.id,
          remember = props.remember,
          storage = props.storage,
          storageKey = props.storageKey;

      if (id && remember && storage) {
        var posStorage = getStorageMap(storageKey)[id];

        if (posStorage) {
          var boxElem = getBox();

          var _a = posStorage.split(','),
              left = _a[0],
              top_1 = _a[1],
              width = _a[2],
              height = _a[3],
              zoomLeft = _a[4],
              zoomTop = _a[5],
              zoomWidth = _a[6],
              zoomHeight = _a[7];

          if (left) {
            boxElem.style.left = left + "px";
          }

          if (top_1) {
            boxElem.style.top = top_1 + "px";
          }

          if (width) {
            boxElem.style.width = width + "px";
          }

          if (height) {
            boxElem.style.height = height + "px";
          }

          if (zoomLeft && zoomTop) {
            reactData.zoomLocat = {
              left: zoomLeft,
              top: zoomTop,
              width: zoomWidth,
              height: zoomHeight
            };
          }
        }
      }
    };

    var addMsgQueue = function addMsgQueue() {
      if (msgQueue.indexOf($xemodal) === -1) {
        msgQueue.push($xemodal);
      }

      updateStyle();
    };

    var savePosStorage = function savePosStorage() {
      var id = props.id,
          remember = props.remember,
          storage = props.storage,
          storageKey = props.storageKey;
      var zoomLocat = reactData.zoomLocat;

      if (id && remember && storage) {
        var boxElem = getBox();
        var posStorageMap = getStorageMap(storageKey);
        posStorageMap[id] = [boxElem.style.left, boxElem.style.top, boxElem.style.width, boxElem.style.height].concat(zoomLocat ? [zoomLocat.left, zoomLocat.top, zoomLocat.width, zoomLocat.height] : []).map(function (val) {
          return val ? _xeUtils.default.toNumber(val) : '';
        }).join(',');
        localStorage.setItem(storageKey, _xeUtils.default.toJSONString(posStorageMap));
      }
    };

    var maximize = function maximize() {
      return (0, _vue.nextTick)().then(function () {
        if (!reactData.zoomLocat) {
          var marginSize = _xeUtils.default.toNumber(props.marginSize);

          var boxElem = getBox();

          var _a = (0, _dom.getDomNode)(),
              visibleHeight = _a.visibleHeight,
              visibleWidth = _a.visibleWidth;

          reactData.zoomLocat = {
            top: boxElem.offsetTop,
            left: boxElem.offsetLeft,
            width: boxElem.offsetWidth + (boxElem.style.width ? 0 : 1),
            height: boxElem.offsetHeight + (boxElem.style.height ? 0 : 1)
          };
          Object.assign(boxElem.style, {
            top: marginSize + "px",
            left: marginSize + "px",
            width: visibleWidth - marginSize * 2 + "px",
            height: visibleHeight - marginSize * 2 + "px"
          });
          savePosStorage();
        }
      });
    };

    var openModal = function openModal() {
      var duration = props.duration,
          remember = props.remember,
          showFooter = props.showFooter;
      var inited = reactData.inited,
          visible = reactData.visible;
      var isMsg = computeIsMsg.value;

      if (!inited) {
        reactData.inited = true;
      }

      if (!visible) {
        if (!remember) {
          recalculate();
        }

        reactData.visible = true;
        reactData.contentVisible = false;
        updateZindex();
        allActivedModals.push($xemodal);
        setTimeout(function () {
          reactData.contentVisible = true;
          (0, _vue.nextTick)(function () {
            if (showFooter) {
              var confirmBtn = refConfirmBtn.value;
              var cancelBtn = refCancelBtn.value;
              var operBtn = confirmBtn || cancelBtn;

              if (operBtn) {
                operBtn.focus();
              }
            }

            var type = '';
            var params = {
              type: type
            };
            emit('update:modelValue', true);
            modalMethods.dispatchEvent('show', params);
          });
        }, 10);

        if (isMsg) {
          addMsgQueue();

          if (duration !== -1) {
            setTimeout(function () {
              return closeModal('close');
            }, _xeUtils.default.toNumber(duration));
          }
        } else {
          (0, _vue.nextTick)(function () {
            var fullscreen = props.fullscreen;
            var firstOpen = reactData.firstOpen;

            if (!remember || !firstOpen) {
              updatePosition().then(function () {
                setTimeout(function () {
                  return updatePosition();
                }, 20);
              });
            }

            if (!firstOpen) {
              reactData.firstOpen = true;

              if (hasPosStorage()) {
                restorePosStorage();
              } else if (fullscreen) {
                (0, _vue.nextTick)(function () {
                  return maximize();
                });
              }
            }
          });
        }
      }

      return (0, _vue.nextTick)();
    };

    var selfClickEvent = function selfClickEvent(evnt) {
      var el = refElem.value;

      if (props.maskClosable && evnt.target === el) {
        var type = 'mask';
        closeModal(type);
      }
    };

    var handleGlobalKeydownEvent = function handleGlobalKeydownEvent(evnt) {
      var isEsc = (0, _event.hasEventKey)(evnt, _event.EVENT_KEYS.ESCAPE);

      if (isEsc) {
        var lastModal_1 = _xeUtils.default.max(allActivedModals, function (item) {
          return item.reactData.modalZindex;
        }); // ???????????????????????????????????????


        if (lastModal_1) {
          setTimeout(function () {
            if (lastModal_1 === $xemodal && lastModal_1.props.escClosable) {
              closeModal('exit');
            }
          }, 10);
        }
      }
    };

    var isMaximized = function isMaximized() {
      return !!reactData.zoomLocat;
    };

    var revert = function revert() {
      return (0, _vue.nextTick)().then(function () {
        var zoomLocat = reactData.zoomLocat;

        if (zoomLocat) {
          var boxElem = getBox();
          reactData.zoomLocat = null;
          Object.assign(boxElem.style, {
            top: zoomLocat.top + "px",
            left: zoomLocat.left + "px",
            width: zoomLocat.width + "px",
            height: zoomLocat.height + "px"
          });
          savePosStorage();
        }
      });
    };

    var zoom = function zoom() {
      if (reactData.zoomLocat) {
        return revert().then(function () {
          return isMaximized();
        });
      }

      return maximize().then(function () {
        return isMaximized();
      });
    };

    var toggleZoomEvent = function toggleZoomEvent(evnt) {
      var zoomLocat = reactData.zoomLocat;
      var params = {
        type: zoomLocat ? 'revert' : 'max'
      };
      return zoom().then(function () {
        modalMethods.dispatchEvent('zoom', params, evnt);
      });
    };

    var getPosition = function getPosition() {
      var isMsg = computeIsMsg.value;

      if (!isMsg) {
        var boxElem = getBox();

        if (boxElem) {
          return {
            top: boxElem.offsetTop,
            left: boxElem.offsetLeft
          };
        }
      }

      return null;
    };

    var setPosition = function setPosition(top, left) {
      var isMsg = computeIsMsg.value;

      if (!isMsg) {
        var boxElem = getBox();

        if (_xeUtils.default.isNumber(top)) {
          boxElem.style.top = top + "px";
        }

        if (_xeUtils.default.isNumber(left)) {
          boxElem.style.left = left + "px";
        }
      }

      return (0, _vue.nextTick)();
    };

    var boxMousedownEvent = function boxMousedownEvent() {
      var modalZindex = reactData.modalZindex;

      if (allActivedModals.some(function (comp) {
        return comp.reactData.visible && comp.reactData.modalZindex > modalZindex;
      })) {
        updateZindex();
      }
    };

    var mousedownEvent = function mousedownEvent(evnt) {
      var remember = props.remember,
          storage = props.storage;
      var zoomLocat = reactData.zoomLocat;

      var marginSize = _xeUtils.default.toNumber(props.marginSize);

      var boxElem = getBox();

      if (!zoomLocat && evnt.button === 0 && !(0, _dom.getEventTargetNode)(evnt, boxElem, 'trigger--btn').flag) {
        evnt.preventDefault();
        var domMousemove_1 = document.onmousemove;
        var domMouseup_1 = document.onmouseup;
        var disX_1 = evnt.clientX - boxElem.offsetLeft;
        var disY_1 = evnt.clientY - boxElem.offsetTop;

        var _a = (0, _dom.getDomNode)(),
            visibleHeight_1 = _a.visibleHeight,
            visibleWidth_1 = _a.visibleWidth;

        document.onmousemove = function (evnt) {
          evnt.preventDefault();
          var offsetWidth = boxElem.offsetWidth;
          var offsetHeight = boxElem.offsetHeight;
          var minX = marginSize;
          var maxX = visibleWidth_1 - offsetWidth - marginSize - 1;
          var minY = marginSize;
          var maxY = visibleHeight_1 - offsetHeight - marginSize - 1;
          var left = evnt.clientX - disX_1;
          var top = evnt.clientY - disY_1;

          if (left > maxX) {
            left = maxX;
          }

          if (left < minX) {
            left = minX;
          }

          if (top > maxY) {
            top = maxY;
          }

          if (top < minY) {
            top = minY;
          }

          boxElem.style.left = left + "px";
          boxElem.style.top = top + "px";
        };

        document.onmouseup = function () {
          document.onmousemove = domMousemove_1;
          document.onmouseup = domMouseup_1;

          if (remember && storage) {
            (0, _vue.nextTick)(function () {
              savePosStorage();
            });
          }
        };
      }
    };

    var dragEvent = function dragEvent(evnt) {
      evnt.preventDefault();
      var remember = props.remember,
          storage = props.storage;

      var _a = (0, _dom.getDomNode)(),
          visibleHeight = _a.visibleHeight,
          visibleWidth = _a.visibleWidth;

      var marginSize = _xeUtils.default.toNumber(props.marginSize);

      var targetElem = evnt.target;
      var type = targetElem.getAttribute('type');

      var minWidth = _xeUtils.default.toNumber(props.minWidth);

      var minHeight = _xeUtils.default.toNumber(props.minHeight);

      var maxWidth = visibleWidth;
      var maxHeight = visibleHeight;
      var boxElem = getBox();
      var domMousemove = document.onmousemove;
      var domMouseup = document.onmouseup;
      var clientWidth = boxElem.clientWidth;
      var clientHeight = boxElem.clientHeight;
      var disX = evnt.clientX;
      var disY = evnt.clientY;
      var offsetTop = boxElem.offsetTop;
      var offsetLeft = boxElem.offsetLeft;
      var params = {
        type: 'resize'
      };

      document.onmousemove = function (evnt) {
        evnt.preventDefault();
        var dragLeft;
        var dragTop;
        var width;
        var height;

        switch (type) {
          case 'wl':
            dragLeft = disX - evnt.clientX;
            width = dragLeft + clientWidth;

            if (offsetLeft - dragLeft > marginSize) {
              if (width > minWidth) {
                boxElem.style.width = (width < maxWidth ? width : maxWidth) + "px";
                boxElem.style.left = offsetLeft - dragLeft + "px";
              }
            }

            break;

          case 'swst':
            dragLeft = disX - evnt.clientX;
            dragTop = disY - evnt.clientY;
            width = dragLeft + clientWidth;
            height = dragTop + clientHeight;

            if (offsetLeft - dragLeft > marginSize) {
              if (width > minWidth) {
                boxElem.style.width = (width < maxWidth ? width : maxWidth) + "px";
                boxElem.style.left = offsetLeft - dragLeft + "px";
              }
            }

            if (offsetTop - dragTop > marginSize) {
              if (height > minHeight) {
                boxElem.style.height = (height < maxHeight ? height : maxHeight) + "px";
                boxElem.style.top = offsetTop - dragTop + "px";
              }
            }

            break;

          case 'swlb':
            dragLeft = disX - evnt.clientX;
            dragTop = evnt.clientY - disY;
            width = dragLeft + clientWidth;
            height = dragTop + clientHeight;

            if (offsetLeft - dragLeft > marginSize) {
              if (width > minWidth) {
                boxElem.style.width = (width < maxWidth ? width : maxWidth) + "px";
                boxElem.style.left = offsetLeft - dragLeft + "px";
              }
            }

            if (offsetTop + height + marginSize < visibleHeight) {
              if (height > minHeight) {
                boxElem.style.height = (height < maxHeight ? height : maxHeight) + "px";
              }
            }

            break;

          case 'st':
            dragTop = disY - evnt.clientY;
            height = clientHeight + dragTop;

            if (offsetTop - dragTop > marginSize) {
              if (height > minHeight) {
                boxElem.style.height = (height < maxHeight ? height : maxHeight) + "px";
                boxElem.style.top = offsetTop - dragTop + "px";
              }
            }

            break;

          case 'wr':
            dragLeft = evnt.clientX - disX;
            width = dragLeft + clientWidth;

            if (offsetLeft + width + marginSize < visibleWidth) {
              if (width > minWidth) {
                boxElem.style.width = (width < maxWidth ? width : maxWidth) + "px";
              }
            }

            break;

          case 'sest':
            dragLeft = evnt.clientX - disX;
            dragTop = disY - evnt.clientY;
            width = dragLeft + clientWidth;
            height = dragTop + clientHeight;

            if (offsetLeft + width + marginSize < visibleWidth) {
              if (width > minWidth) {
                boxElem.style.width = (width < maxWidth ? width : maxWidth) + "px";
              }
            }

            if (offsetTop - dragTop > marginSize) {
              if (height > minHeight) {
                boxElem.style.height = (height < maxHeight ? height : maxHeight) + "px";
                boxElem.style.top = offsetTop - dragTop + "px";
              }
            }

            break;

          case 'selb':
            dragLeft = evnt.clientX - disX;
            dragTop = evnt.clientY - disY;
            width = dragLeft + clientWidth;
            height = dragTop + clientHeight;

            if (offsetLeft + width + marginSize < visibleWidth) {
              if (width > minWidth) {
                boxElem.style.width = (width < maxWidth ? width : maxWidth) + "px";
              }
            }

            if (offsetTop + height + marginSize < visibleHeight) {
              if (height > minHeight) {
                boxElem.style.height = (height < maxHeight ? height : maxHeight) + "px";
              }
            }

            break;

          case 'sb':
            dragTop = evnt.clientY - disY;
            height = dragTop + clientHeight;

            if (offsetTop + height + marginSize < visibleHeight) {
              if (height > minHeight) {
                boxElem.style.height = (height < maxHeight ? height : maxHeight) + "px";
              }
            }

            break;
        }

        boxElem.className = boxElem.className.replace(/\s?is--drag/, '') + ' is--drag';

        if (remember && storage) {
          savePosStorage();
        }

        modalMethods.dispatchEvent('zoom', params, evnt);
      };

      document.onmouseup = function () {
        reactData.zoomLocat = null;
        document.onmousemove = domMousemove;
        document.onmouseup = domMouseup;
        setTimeout(function () {
          boxElem.className = boxElem.className.replace(/\s?is--drag/, '');
        }, 50);
      };
    };

    var renderTitles = function renderTitles() {
      var _a = props.slots,
          propSlots = _a === void 0 ? {} : _a,
          showClose = props.showClose,
          showZoom = props.showZoom,
          title = props.title;
      var zoomLocat = reactData.zoomLocat;
      var titleSlot = slots.title || propSlots.title;
      var titVNs = titleSlot ? titleSlot({
        $modal: $xemodal
      }) : [(0, _vue.h)('span', {
        class: 'vxe-modal--title'
      }, title ? (0, _utils.getFuncText)(title) : _conf.default.i18n('vxe.alert.title'))];

      if (showZoom) {
        titVNs.push((0, _vue.h)('i', {
          class: ['vxe-modal--zoom-btn', 'trigger--btn', zoomLocat ? _conf.default.icon.MODAL_ZOOM_OUT : _conf.default.icon.MODAL_ZOOM_IN],
          title: _conf.default.i18n("vxe.modal.zoom" + (zoomLocat ? 'Out' : 'In')),
          onClick: toggleZoomEvent
        }));
      }

      if (showClose) {
        titVNs.push((0, _vue.h)('i', {
          class: ['vxe-modal--close-btn', 'trigger--btn', _conf.default.icon.MODAL_CLOSE],
          title: _conf.default.i18n('vxe.modal.close'),
          onClick: closeEvent
        }));
      }

      return titVNs;
    };

    var renderHeaders = function renderHeaders() {
      var _a = props.slots,
          propSlots = _a === void 0 ? {} : _a,
          showZoom = props.showZoom,
          draggable = props.draggable;
      var isMsg = computeIsMsg.value;
      var headerSlot = slots.header || propSlots.header;
      var headVNs = [];

      if (props.showHeader) {
        var headerOns = {};

        if (draggable) {
          headerOns.onMousedown = mousedownEvent;
        }

        if (showZoom && props.dblclickZoom && props.type === 'modal') {
          headerOns.onDblclick = toggleZoomEvent;
        }

        headVNs.push((0, _vue.h)('div', __assign({
          class: ['vxe-modal--header', {
            'is--drag': draggable,
            'is--ellipsis': !isMsg && props.showTitleOverflow
          }]
        }, headerOns), headerSlot ? !reactData.inited || props.destroyOnClose && !reactData.visible ? [] : headerSlot({
          $modal: $xemodal
        }) : renderTitles()));
      }

      return headVNs;
    };

    var renderBodys = function renderBodys() {
      var _a = props.slots,
          propSlots = _a === void 0 ? {} : _a,
          status = props.status,
          message = props.message;
      var content = props.content || message;
      var isMsg = computeIsMsg.value;
      var defaultSlot = slots.default || propSlots.default;
      var contVNs = [];

      if (status) {
        contVNs.push((0, _vue.h)('div', {
          class: 'vxe-modal--status-wrapper'
        }, [(0, _vue.h)('i', {
          class: ['vxe-modal--status-icon', props.iconStatus || _conf.default.icon[("MODAL_" + status).toLocaleUpperCase()]]
        })]));
      }

      contVNs.push((0, _vue.h)('div', {
        class: 'vxe-modal--content'
      }, defaultSlot ? !reactData.inited || props.destroyOnClose && !reactData.visible ? [] : defaultSlot({
        $modal: $xemodal
      }) : (0, _utils.getFuncText)(content)));

      if (!isMsg) {
        contVNs.push((0, _vue.h)('div', {
          class: ['vxe-loading', {
            'is--visible': props.loading
          }]
        }, [(0, _vue.h)('div', {
          class: 'vxe-loading--spinner'
        })]));
      }

      return [(0, _vue.h)('div', {
        class: 'vxe-modal--body'
      }, contVNs)];
    };

    var renderBtns = function renderBtns() {
      var type = props.type;
      var btnVNs = [];

      if (type === 'confirm') {
        btnVNs.push((0, _vue.h)(_button.default, {
          ref: refCancelBtn,
          content: props.cancelButtonText || _conf.default.i18n('vxe.button.cancel'),
          onClick: cancelEvent
        }));
      }

      btnVNs.push((0, _vue.h)(_button.default, {
        ref: refConfirmBtn,
        status: 'primary',
        content: props.confirmButtonText || _conf.default.i18n('vxe.button.confirm'),
        onClick: confirmEvent
      }));
      return btnVNs;
    };

    var renderFooters = function renderFooters() {
      var _a = props.slots,
          propSlots = _a === void 0 ? {} : _a;
      var isMsg = computeIsMsg.value;
      var footerSlot = slots.footer || propSlots.footer;
      var footVNs = [];

      if (props.showFooter) {
        footVNs.push((0, _vue.h)('div', {
          class: 'vxe-modal--footer'
        }, footerSlot ? !reactData.inited || props.destroyOnClose && !reactData.visible ? [] : footerSlot({
          $modal: $xemodal
        }) : renderBtns()));
      }

      if (!isMsg && props.resize) {
        footVNs.push((0, _vue.h)('span', {
          class: 'vxe-modal--resize'
        }, ['wl', 'wr', 'swst', 'sest', 'st', 'swlb', 'selb', 'sb'].map(function (type) {
          return (0, _vue.h)('span', {
            class: type + "-resize",
            type: type,
            onMousedown: dragEvent
          });
        })));
      }

      return footVNs;
    };

    modalMethods = {
      dispatchEvent: function dispatchEvent(type, params, evnt) {
        emit(type, Object.assign({
          $modal: $xemodal,
          $event: evnt
        }, params));
      },
      open: openModal,
      close: function close() {
        return closeModal('close');
      },
      getBox: getBox,
      getPosition: getPosition,
      setPosition: setPosition,
      isMaximized: isMaximized,
      zoom: zoom,
      maximize: maximize,
      revert: revert
    };
    Object.assign($xemodal, modalMethods);
    (0, _vue.watch)(function () {
      return props.width;
    }, recalculate);
    (0, _vue.watch)(function () {
      return props.height;
    }, recalculate);
    (0, _vue.watch)(function () {
      return props.modelValue;
    }, function (value) {
      if (value) {
        openModal();
      } else {
        closeModal('model');
      }
    });
    (0, _vue.onMounted)(function () {
      (0, _vue.nextTick)(function () {
        if (props.storage && !props.id) {
          (0, _utils.errLog)('vxe.error.reqProp', ['modal.id']);
        }

        if (props.modelValue) {
          openModal();
        }

        recalculate();
      });

      if (props.escClosable) {
        _event.GlobalEvent.on($xemodal, 'keydown', handleGlobalKeydownEvent);
      }
    });
    (0, _vue.onUnmounted)(function () {
      _event.GlobalEvent.off($xemodal, 'keydown');

      removeMsgQueue();
    });

    var renderVN = function renderVN() {
      var _a;

      var className = props.className,
          type = props.type,
          animat = props.animat,
          loading = props.loading,
          status = props.status,
          lockScroll = props.lockScroll,
          lockView = props.lockView,
          mask = props.mask,
          resize = props.resize;
      var inited = reactData.inited,
          zoomLocat = reactData.zoomLocat,
          modalTop = reactData.modalTop,
          contentVisible = reactData.contentVisible,
          visible = reactData.visible;
      var vSize = computeSize.value;
      return (0, _vue.h)(_vue.Teleport, {
        to: 'body',
        disabled: props.transfer ? !inited : true
      }, [(0, _vue.h)('div', {
        ref: refElem,
        class: ['vxe-modal--wrapper', "type--" + type, className || '', (_a = {}, _a["size--" + vSize] = vSize, _a["status--" + status] = status, _a['is--animat'] = animat, _a['lock--scroll'] = lockScroll, _a['lock--view'] = lockView, _a['is--resize'] = resize, _a['is--mask'] = mask, _a['is--maximize'] = zoomLocat, _a['is--visible'] = contentVisible, _a['is--active'] = visible, _a['is--loading'] = loading, _a)],
        style: {
          zIndex: reactData.modalZindex,
          top: modalTop ? modalTop + "px" : null
        },
        onClick: selfClickEvent
      }, [(0, _vue.h)('div', {
        ref: refModalBox,
        class: 'vxe-modal--box',
        onMousedown: boxMousedownEvent
      }, renderHeaders().concat(renderBodys(), renderFooters()))])]);
    };

    $xemodal.renderVN = renderVN;
    return $xemodal;
  },
  render: function render() {
    return this.renderVN();
  }
});

exports.default = _default2;