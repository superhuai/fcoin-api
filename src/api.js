"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const types_1 = require("./types");
const _1 = require(".");
class FcoinApi {
    constructor(key, secret) {
        this.UserConfig = {
            Key: '',
            Secret: '',
        };
        this.UserConfig.Key = key;
        this.UserConfig.Secret = secret;
    }
    /**
     * 创建订单（买卖）
     */
    OrderCreate(symbol, side, type = 'limit', price, amount) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const time = Date.now().toString();
            const signtmp = this.secret(`POST${_1.FcoinUrl.order}${time}amount=${amount}&price=${price}&side=${side}&symbol=${symbol}&type=${type}`);
            // 发送新建订单的请求
            return node_fetch_1.default(_1.FcoinUrl.order, {
                method: 'post',
                headers: {
                    'FC-ACCESS-KEY': this.UserConfig.Key,
                    'FC-ACCESS-SIGNATURE': signtmp,
                    'FC-ACCESS-TIMESTAMP': time,
                    'Content-Type': 'application/json;charset=UTF-8',
                },
                body: JSON.stringify({ type, side, amount, price, symbol }),
            }).then(res => res.json()).then(res => {
                if (res.status)
                    return new types_1.FcoinApiRes(null, res);
                return res;
            }).catch(e => {
                return new types_1.FcoinApiRes(null, { status: 1, e });
            });
        });
    }
    /**
     * 撤销订单（买卖）
     */
    OrderCancel(id) {
        const time = Date.now().toString();
        const url = `${_1.FcoinUrl.order}/${id}/submit-cancel`;
        const signtmp = this.secret(`POST${url}${time}`);
        // 发送新建订单的请求
        return node_fetch_1.default(url, {
            method: 'post',
            headers: {
                'FC-ACCESS-KEY': this.UserConfig.Key,
                'FC-ACCESS-SIGNATURE': signtmp,
                'FC-ACCESS-TIMESTAMP': time,
                'Content-Type': 'application/json;charset=UTF-8',
            },
        }).then(res => res.json()).then(res => {
            if (res.status)
                return new types_1.FcoinApiRes(null, res);
            return res;
        }).catch(e => {
            return new types_1.FcoinApiRes(null, { status: 1, e });
        });
    }
    // 查询账户资产
    FetchBalance() {
        const time = Date.now().toString();
        const signtmp = this.secret(`GET${_1.FcoinUrl.balance}${time}`);
        return node_fetch_1.default(_1.FcoinUrl.balance, {
            method: 'GET',
            headers: {
                'FC-ACCESS-KEY': this.UserConfig.Key,
                'FC-ACCESS-SIGNATURE': signtmp,
                'FC-ACCESS-TIMESTAMP': time,
            },
        }).then(res => res.json()).then((res) => {
            if (res.status)
                return new types_1.FcoinApiRes(null, res);
            return res;
        }).catch(e => {
            return new types_1.FcoinApiRes(null, { status: 1, e });
        });
    }
    // 查询所有订单
    FetchOrders(symbol, states = 'submitted,filled', limit = '100', after = '', before = '') {
        const time = Date.now().toString();
        let url;
        if (before) {
            url = `${_1.FcoinUrl.order}?before=${before}&limit=${limit}&states=${states}&symbol=${symbol}`;
        }
        else if (after) {
            url = `${_1.FcoinUrl.order}?after=${after}&limit=${limit}&states=${states}&symbol=${symbol}`;
        }
        else {
            url = `${_1.FcoinUrl.order}?limit=${limit}&states=${states}&symbol=${symbol}`;
        }
        const signtmp = this.secret(`GET${url}${time}`);
        return node_fetch_1.default(url, {
            method: 'GET',
            headers: {
                'FC-ACCESS-KEY': this.UserConfig.Key,
                'FC-ACCESS-SIGNATURE': signtmp,
                'FC-ACCESS-TIMESTAMP': time,
            },
        }).then(res => res.json()).then(res => {
            if (res.status)
                return new types_1.FcoinApiRes(null, res);
            return res;
        }).catch(e => {
            return new types_1.FcoinApiRes(null, { status: 1, e });
        });
    }
    // 获取指定 id 的订单
    FetchOrderById(id) {
        const time = Date.now().toString();
        const url = `${_1.FcoinUrl.order}/${id}`;
        const signtmp = this.secret(`GET${url}${time}`);
        return node_fetch_1.default(url, {
            method: 'GET',
            headers: {
                'FC-ACCESS-KEY': this.UserConfig.Key,
                'FC-ACCESS-SIGNATURE': signtmp,
                'FC-ACCESS-TIMESTAMP': time,
            },
        }).then(res => res.json()).then((res) => {
            if (res.status)
                return new types_1.FcoinApiRes(null, res);
            return res;
        }).catch(e => {
            return new types_1.FcoinApiRes(null, { status: 1, e });
        });
    }
    /**
     * 行情接口(ticker)
     */
    Ticker(symbol) {
        let url = `${_1.FcoinUrl.market_http}/ticker/${symbol}`;
        return node_fetch_1.default(url, {
            method: 'GET',
        }).then(res => res.json()).then((res) => {
            if (res.status)
                return new types_1.FcoinApiRes(null, res);
            const ticker = res.data.ticker;
            return new types_1.FcoinApiRes({
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
        }).catch(e => {
            return new types_1.FcoinApiRes(null, { status: 1, e });
        });
    }
    /**
     * 深度查询
     */
    Depth(symbol, deep) {
        const url = `${_1.FcoinUrl.market_http}/depth/${deep}/${symbol}`;
        return node_fetch_1.default(url, {
            method: 'GET',
        }).then(res => res.json()).then((res) => {
            if (res.status)
                return new types_1.FcoinApiRes(null, res);
            const bids = [];
            const asks = [];
            res.data.bids.forEach((num, index) => {
                const isVol = Boolean(index % 2);
                const realIndex = Math.floor(index / 2);
                if (!isVol) {
                    bids.push({ price: num, vol: 0 });
                }
                else {
                    bids[realIndex].vol = num;
                }
            });
            res.data.asks.forEach((num, index) => {
                const isVol = Boolean(index % 2);
                const realIndex = Math.floor(index / 2);
                if (!isVol) {
                    asks.push({ price: num, vol: 0 });
                }
                else {
                    asks[realIndex].vol = num;
                }
            });
            return new types_1.FcoinApiRes({
                bids, asks,
                seq: res.data.seq,
                ts: res.data.ts,
                type: res.data.type,
            });
        }).catch(e => {
            return new types_1.FcoinApiRes(null, { status: 1, e });
        });
    }
    // 工具类
    tob64(str) {
        return new Buffer(str).toString('base64');
    }
    secret(str) {
        str = this.tob64(str);
        str = crypto_1.default.createHmac('sha1', this.UserConfig.Secret).update(str).digest().toString('base64');
        return str;
    }
}
exports.FcoinApi = FcoinApi;
//# sourceMappingURL=api.js.map