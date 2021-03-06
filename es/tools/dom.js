import XEUtils from 'xe-utils';
var reClsMap = {};
export var browse = XEUtils.browse();
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
export function isPx(val) {
    return val && /^\d+(px)?$/.test(val);
}
export function isScale(val) {
    return val && /^\d+%$/.test(val);
}
export function hasClass(elem, cls) {
    return elem && elem.className && elem.className.match && elem.className.match(getClsRE(cls));
}
export function removeClass(elem, cls) {
    if (elem && hasClass(elem, cls)) {
        elem.className = elem.className.replace(getClsRE(cls), '');
    }
}
export function addClass(elem, cls) {
    if (elem && !hasClass(elem, cls)) {
        removeClass(elem, cls);
        elem.className = elem.className + " " + cls;
    }
}
export function getDomNode() {
    var documentElement = document.documentElement;
    var bodyElem = document.body;
    return {
        scrollTop: documentElement.scrollTop || bodyElem.scrollTop,
        scrollLeft: documentElement.scrollLeft || bodyElem.scrollLeft,
        visibleHeight: documentElement.clientHeight || bodyElem.clientHeight,
        visibleWidth: documentElement.clientWidth || bodyElem.clientWidth
    };
}
export function getOffsetHeight(elem) {
    return elem ? elem.offsetHeight : 0;
}
export function getPaddingTopBottomSize(elem) {
    if (elem) {
        var computedStyle = getComputedStyle(elem);
        var paddingTop = XEUtils.toNumber(computedStyle.paddingTop);
        var paddingBottom = XEUtils.toNumber(computedStyle.paddingBottom);
        return paddingTop + paddingBottom;
    }
    return 0;
}
export function setScrollTop(elem, scrollTop) {
    if (elem) {
        elem.scrollTop = scrollTop;
    }
}
export function setScrollLeft(elem, scrollLeft) {
    if (elem) {
        elem.scrollLeft = scrollLeft;
    }
}
export function updateCellTitle(overflowElem, column) {
    var content = column.type === 'html' ? overflowElem.innerText : overflowElem.textContent;
    if (overflowElem.getAttribute('title') !== content) {
        overflowElem.setAttribute('title', content);
    }
}
/**
 * ???????????????????????????????????????
 */
export function getEventTargetNode(evnt, container, queryCls, queryMethod) {
    var targetElem;
    var target = evnt.target;
    while (target && target.nodeType && target !== document) {
        if (queryCls && hasClass(target, queryCls) && (!queryMethod || queryMethod(target))) {
            targetElem = target;
        }
        else if (target === container) {
            return { flag: queryCls ? !!targetElem : true, container: container, targetElem: targetElem };
        }
        target = target.parentNode;
    }
    return { flag: false };
}
/**
 * ????????????????????? document ?????????
 */
export function getOffsetPos(elem, container) {
    return getNodeOffset(elem, container, { left: 0, top: 0 });
}
export function getAbsolutePos(elem) {
    var bounding = elem.getBoundingClientRect();
    var boundingTop = bounding.top;
    var boundingLeft = bounding.left;
    var _a = getDomNode(), scrollTop = _a.scrollTop, scrollLeft = _a.scrollLeft, visibleHeight = _a.visibleHeight, visibleWidth = _a.visibleWidth;
    return { boundingTop: boundingTop, top: scrollTop + boundingTop, boundingLeft: boundingLeft, left: scrollLeft + boundingLeft, visibleHeight: visibleHeight, visibleWidth: visibleWidth };
}
var scrollIntoViewIfNeeded = 'scrollIntoViewIfNeeded';
var scrollIntoView = 'scrollIntoView';
export function scrollToView(elem) {
    if (elem) {
        if (elem[scrollIntoViewIfNeeded]) {
            elem[scrollIntoViewIfNeeded]();
        }
        else if (elem[scrollIntoView]) {
            elem[scrollIntoView]();
        }
    }
}
export function triggerEvent(targetElem, type) {
    var evnt;
    if (typeof Event === 'function') {
        evnt = new Event(type);
    }
    else {
        evnt = document.createEvent('Event');
        evnt.initEvent(type, true, true);
    }
    targetElem.dispatchEvent(evnt);
}
