"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const API = {
    order: 'https://api.fcoin.com/v2/orders',
    market: 'wss://api.fcoin.com/v2/ws',
    market_http: 'https://api.fcoin.com/v2/market/',
    balance: 'https://api.fcoin.com/v2/accounts/balance',
};
class FcoinApi {
    constructor(key, secret) {
        this.Config = {
            Key: '',
            Secret: '',
        };
        this.Config.Key = key;
        this.Config.Secret = secret;
    }
    /**
     * 创建订单（买卖）
     */
    OrderCreate(symbol, side, type, price, amount) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const time = Date.now().toString();
            const signtmp = this.secret(`POST${API.order}${time}amount=${amount}&price=${price}&side=${side}&symbol=${symbol}&type=${type}`);
            return node_fetch_1.default(API.order, {
                method: 'post',
                headers: {
                    'FC-ACCESS-KEY': this.Config.Key,
                    'FC-ACCESS-SIGNATURE': signtmp,
                    'FC-ACCESS-TIMESTAMP': time,
                    'Content-Type': 'application/json;charset=UTF-8',
                },
                body: JSON.stringify({ type, side, amount, price, symbol }),
            }).then(res => res.json());
        });
    }
    /**
     * 撤销订单（买卖）
     */
    OrderCancel(id) {
        const time = Date.now().toString();
        const url = `${API.order}/${id}/submit-cancel`;
        const signtmp = this.secret(`POST${url}${time}`);
        // 发送新建订单的请求
        return node_fetch_1.default(url, {
            method: 'post',
            headers: {
                'FC-ACCESS-KEY': this.Config.Key,
                'FC-ACCESS-SIGNATURE': signtmp,
                'FC-ACCESS-TIMESTAMP': time,
                'Content-Type': 'application/json;charset=UTF-8',
            },
        }).then(res => res.json());
    }
    // 查询账户资产
    FetchBalance() {
        const time = Date.now().toString();
        const signtmp = this.secret(`GET${API.balance}${time}`);
        return node_fetch_1.default(API.balance, {
            method: 'GET',
            headers: {
                'FC-ACCESS-KEY': this.Config.Key,
                'FC-ACCESS-SIGNATURE': signtmp,
                'FC-ACCESS-TIMESTAMP': time,
            },
        }).then(res => res.json());
    }
    // 查询所有订单
    FetchOrders(symbol, states = 'submitted,filled', limit = '100', after = '', before = '') {
        const time = Date.now().toString();
        let url;
        if (before) {
            url = `${API.order}?before=${before}&limit=${limit}&states=${states}&symbol=${symbol}`;
        }
        else if (after) {
            url = `${API.order}?after=${after}&limit=${limit}&states=${states}&symbol=${symbol}`;
        }
        else {
            url = `${API.order}?limit=${limit}&states=${states}&symbol=${symbol}`;
        }
        const signtmp = this.secret(`GET${url}${time}`);
        return node_fetch_1.default(url, {
            method: 'GET',
            headers: {
                'FC-ACCESS-KEY': this.Config.Key,
                'FC-ACCESS-SIGNATURE': signtmp,
                'FC-ACCESS-TIMESTAMP': time,
            },
        }).then(res => res.json());
    }
    // 获取指定 id 的订单
    FetchOrderById(id) {
        const time = Date.now().toString();
        const url = `${API.order}/${id}`;
        const signtmp = this.secret(`GET${url}${time}`);
        return node_fetch_1.default(url, {
            method: 'GET',
            headers: {
                'FC-ACCESS-KEY': this.Config.Key,
                'FC-ACCESS-SIGNATURE': signtmp,
                'FC-ACCESS-TIMESTAMP': time,
            },
        }).then(res => res.json());
    }
    /**
     * 行情接口(ticker)
     */
    Ticker(symbol) {
        let url = `${API.market_http}/ticker/${symbol}`;
        return node_fetch_1.default(url, {
            method: 'GET',
        }).then(res => res.json()).then((res) => {
            if (res.status)
                return res;
            const ticker = res.data.ticker;
            return new FcoinApiRes({
                seq: res.data.seq,
                type: res.data.type,
                LastPrice: ticker[0],
                LastVolume: ticker[1],
                MaxBuyPrice: ticker[2],
                MaxBuyVolume: ticker[3],
                MinSalePrice: ticker[4],
                MinSaleVolume: ticker[5],
                BeforeH24Price: ticker[6],
                HighestH24Price: ticker[7],
                LowestH24Price: ticker[8],
                OneDayVolume1: ticker[9],
                OneDayVolume2: ticker[10],
            });
        });
    }
    /**
     * 深度查询
     */
    Depth(depth, symbol) {
        const url = `${API.market_http}/depth/${depth}/${symbol}`;
        return node_fetch_1.default(url, {
            method: 'GET',
        }).then(res => res.json()).then((res) => {
            if (res.status)
                return res;
            const bids = [];
            const asks = [];
            res.data.bids.forEach((num, index) => {
                const isVol = Boolean(index % 2);
                const realIndex = Math.floor(index / 2);
                if (!isVol) {
                    bids.push({ Price: num, Volume: 0 });
                }
                else {
                    bids[realIndex].Volume = num;
                }
            });
            res.data.asks.forEach((num, index) => {
                const isVol = Boolean(index % 2);
                const realIndex = Math.floor(index / 2);
                if (!isVol) {
                    asks.push({ Price: num, Volume: 0 });
                }
                else {
                    asks[realIndex].Volume = num;
                }
            });
            return new FcoinApiRes({
                bids, asks,
                seq: res.data.seq,
                ts: res.data.ts,
                type: res.data.type,
            });
        });
    }
    // 工具类
    tob64(str) {
        return new Buffer(str).toString('base64');
    }
    secret(str) {
        str = this.tob64(str);
        str = crypto_1.default.createHmac('sha1', this.Config.Secret).update(str).digest().toString('base64');
        return str;
    }
}
exports.FcoinApi = FcoinApi;
class FcoinApiRes {
    constructor(data) {
        this.status = 0;
        this.data = data;
    }
}
exports.FcoinApiRes = FcoinApiRes;
/**
 * @param {已提交} submitted
 * @param {部分成交} partial_filled
 * @param {部分成交已撤销} partial_canceled
 * @param {完全成交} filled
 * @param {已撤销} canceled
 * @param {撤销已提交} pending_cancel
 */
var OrderState;
(function (OrderState) {
    OrderState["submitted"] = "submitted";
    OrderState["partial_filled"] = "partial_filled";
    OrderState["partial_canceled"] = "partial_canceled";
    OrderState["filled"] = "filled";
    OrderState["canceled"] = "canceled";
    OrderState["pending_cancel"] = "pending_cancel";
})(OrderState = exports.OrderState || (exports.OrderState = {}));
//# sourceMappingURL=index.js.map