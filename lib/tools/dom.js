"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addClass = addClass;
exports.browse = void 0;
exports.getAbsolutePos = getAbsolutePos;
exports.getDomNode = getDomNode;
exports.getEventTargetNode = getEventTargetNode;
exports.getOffsetHeight = getOffsetHeight;
exports.getOffsetPos = getOffsetPos;
exports.getPaddingTopBottomSize = getPaddingTopBottomSize;
exports.hasClass = hasClass;
exports.isPx = isPx;
exports.isScale = isScale;
exports.removeClass = removeClass;
exports.scrollToView = scrollToView;
exports.setScrollLeft = setScrollLeft;
exports.setScrollTop = setScrollTop;
exports.triggerEvent = triggerEvent;
exports.updateCellTitle = updateCellTitle;

var _xeUtils = _interopRequireDefault(require("xe-utils"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var reClsMap = {};

var browse = _xeUtils.default.browse();

exports.browse = browse;

function getClsRE(cls) {
  if (!reClsMap[cls]) {
    reClsMap[cls] = new RegExp("(?:^|\\s)" + cls + "(?!\\S)", 'g');
  }

  return reClsMap[cls];
}

function getNodeOffset(elem, container, rest) {
  if (elem) {
    var parentElem = elem.parentNode;
    rest.top += elem.offsetTop;
    rest.left += elem.offsetLeft;

    if (parentElem && parentElem !== document.documentElement && parentElem !== document.body) {
      rest.top -= parentElem.scrollTop;
      rest.left -= parentElem.scrollLeft;
    }

    if (container && (elem === container || elem.offsetParent === container) ? 0 : elem.offsetParent) {
      return getNodeOffset(elem.offsetParent, container, rest);
    }
  }

  return rest;
}

function isPx(val) {
  return val && /^\d+(px)?$/.test(val);
}

function isScale(val) {
  return val && /^\d+%$/.test(val);
}

function hasClass(elem, cls) {
  return elem && elem.className && elem.className.match && elem.className.match(getClsRE(cls));
}

function removeClass(elem, cls) {
  if (elem && hasClass(elem, cls)) {
    elem.className = elem.className.replace(getClsRE(cls), '');
  }
}

function addClass(elem, cls) {
  if (elem && !hasClass(elem, cls)) {
    removeClass(elem, cls);
    elem.className = elem.className + " " + cls;
  }
}

function getDomNode() {
  var documentElement = document.documentElement;
  var bodyElem = document.body;
  return {
    scrollTop: documentElement.scrollTop || bodyElem.scrollTop,
    scrollLeft: documentElement.scrollLeft || bodyElem.scrollLeft,
    visibleHeight: documentElement.clientHeight || bodyElem.clientHeight,
    visibleWidth: documentElement.clientWidth || bodyElem.clientWidth
  };
}

function getOffsetHeight(elem) {
  return elem ? elem.offsetHeight : 0;
}

function getPaddingTopBottomSize(elem) {
  if (elem) {
    var computedStyle = getComputedStyle(elem);

    var paddingTop = _xeUtils.default.toNumber(computedStyle.paddingTop);

    var paddingBottom = _xeUtils.default.toNumber(computedStyle.paddingBottom);

    return paddingTop + paddingBottom;
  }

  return 0;
}

function setScrollTop(elem, scrollTop) {
  if (elem) {
    elem.scrollTop = scrollTop;
  }
}

function setScrollLeft(elem, scrollLeft) {
  if (elem) {
    elem.scrollLeft = scrollLeft;
  }
}

function updateCellTitle(overflowElem, column) {
  var content = column.type === 'html' ? overflowElem.innerText : overflowElem.textContent;

  if (overflowElem.getAttribute('title') !== content) {
    overflowElem.setAttribute('title', content);
  }
}
/**
 * ???????????????????????????????????????
 */


function getEventTargetNode(evnt, container, queryCls, queryMethod) {
  var targetElem;
  var target = evnt.target;

  while (target && target.nodeType && target !== document) {
    if (queryCls && hasClass(target, queryCls) && (!queryMethod || queryMethod(target))) {
      targetElem = target;
    } else if (target === container) {
      return {
        flag: queryCls ? !!targetElem : true,
        container: container,
        targetElem: targetElem
      };
    }

    target = target.parentNode;
  }

  return {
    flag: false
  };
}
/**
 * ????????????????????? document ?????????
 */


function getOffsetPos(elem, container) {
  return getNodeOffset(elem, container, {
    left: 0,
    top: 0
  });
}

function getAbsolutePos(elem) {
  var bounding = elem.getBoundingClientRect();
  var boundingTop = bounding.top;
  var boundingLeft = bounding.left;

  var _a = getDomNode(),
      scrollTop = _a.scrollTop,
      scrollLeft = _a.scrollLeft,
      visibleHeight = _a.visibleHeight,
      visibleWidth = _a.visibleWidth;

  return {
    boundingTop: boundingTop,
    top: scrollTop + boundingTop,
    boundingLeft: boundingLeft,
    left: scrollLeft + boundingLeft,
    visibleHeight: visibleHeight,
    visibleWidth: visibleWidth
  };
}

var scrollIntoViewIfNeeded = 'scrollIntoViewIfNeeded';
var scrollIntoView = 'scrollIntoView';

function scrollToView(elem) {
  if (elem) {
    if (elem[scrollIntoViewIfNeeded]) {
      elem[scrollIntoViewIfNeeded]();
    } else if (elem[scrollIntoView]) {
      elem[scrollIntoView]();
    }
  }
}

function triggerEvent(targetElem, type) {
  var evnt;

  if (typeof Event === 'function') {
    evnt = new Event(type);
  } else {
    evnt = document.createEvent('Event');
    evnt.initEvent(type, true, true);
  }

  targetElem.dispatchEvent(evnt);
}