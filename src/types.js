"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BrocastType;
(function (BrocastType) {
    BrocastType["hello"] = "hello";
    BrocastType["ping"] = "ping";
    BrocastType["topics"] = "topics";
})(BrocastType = exports.BrocastType || (exports.BrocastType = {}));
var SideEnum;
(function (SideEnum) {
    SideEnum["Sell"] = "sell";
    SideEnum["Buy"] = "buy";
})(SideEnum = exports.SideEnum || (exports.SideEnum = {}));
/**
 * 行情深度
 */
var DepthLevel;
(function (DepthLevel) {
    DepthLevel["L20"] = "L20";
    DepthLevel["L100"] = "L100";
    DepthLevel["FULL"] = "full";
})(DepthLevel = exports.DepthLevel || (exports.DepthLevel = {}));
/**
 * M1	1 分钟
 * M3	3 分钟
 * M5	5 分钟
 * M15	15 分钟
 * M30	30 分钟
 * H1	1 小时
 * H4	4 小时
 * H6	6 小时
 * D1	1 日
 * W1	1 周
 * MN	1 月
 */
var CandleResolution;
(function (CandleResolution) {
    CandleResolution["M1"] = "M1";
    CandleResolution["M3"] = "M3";
    CandleResolution["M5"] = "M5";
    CandleResolution["M15"] = "M15";
    CandleResolution["M30"] = "M30";
    CandleResolution["H1"] = "H1";
    CandleResolution["H4"] = "H4";
    CandleResolution["H6"] = "H6";
    CandleResolution["D1"] = "D1";
    CandleResolution["W1"] = "W1";
    CandleResolution["MN"] = "MN";
})(CandleResolution = exports.CandleResolution || (exports.CandleResolution = {}));
var OrderState;
(function (OrderState) {
    OrderState["submitted"] = "submitted";
    OrderState["partial_filled"] = "partial_filled";
    OrderState["partial_canceled"] = "partial_canceled";
    OrderState["filled"] = "filled";
    OrderState["canceled"] = "canceled";
    OrderState["pending_cancel"] = "pending_cancel";
})(OrderState = exports.OrderState || (exports.OrderState = {}));
class FcoinApiRes {
    constructor(data, full = null, msg = '') {
        this.data = data;
        this.status = full ? full.status : 0;
        this.full = full;
        this.msg = msg;
    }
}
exports.FcoinApiRes = FcoinApiRes;
//# sourceMappingURL=types.js.map