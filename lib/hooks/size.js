"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useSize = useSize;

var _vue = require("vue");

function useSize(props) {
  // 组件尺寸上下文
  var xesize = (0, _vue.inject)('xesize', null);
  var computeSize = (0, _vue.computed)(function () {
    return props.size || (xesize ? xesize.value : null);
  });
  (0, _vue.provide)('xesize', computeSize);
  return computeSize;
}