import fetch from 'node-fetch';
import crypto from 'crypto';
import { SymbolEnum, SideEnum, DepthLevel, DepthUnit, FcoinApiRes, CoinHas, OrderResult } from './types';
import { FcoinUrl } from '.';


export class FcoinApi {
  private UserConfig = {
    Key: '',
    Secret: '',
  };

  constructor (key: string, secret: string) {
    this.UserConfig.Key = key;
    this.UserConfig.Secret = secret;
  }

  /**
   * 创建订单（买卖）
   */
  async OrderCreate (symbol: SymbolEnum, side: SideEnum, type = 'limit', price: string, amount: string) {
    const time = Date.now().toString();
    const signtmp = this.secret(`POST${FcoinUrl.order}${time}amount=${amount}&price=${price}&side=${side}&symbol=${symbol}&type=${type}`);

    // 发送新建订单的请求
    return fetch(FcoinUrl.order, {
      method: 'post',
      headers: {
        'FC-ACCESS-KEY': this.UserConfig.Key,
        'FC-ACCESS-SIGNATURE': signtmp,
        'FC-ACCESS-TIMESTAMP': time,
        'Content-Type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify({ type, side, amount, price, symbol }),
    }).then(res => res.json()).then(res => {
      if (res.status) return new FcoinApiRes(null, res);
      return res as FcoinApiRes<string>;
    }).catch(e => {
      return new FcoinApiRes(null, { status: 1, e });
    });
  }

  /**
   * 撤销订单（买卖）
   */
  OrderCancel (id: string) {
    const time = Date.now().toString();
    const url = `${FcoinUrl.order}/${id}/submit-cancel`;
    const signtmp = this.secret(`POST${url}${time}`);

    // 发送新建订单的请求
    return fetch(url, {
      method: 'post',
      headers: {
        'FC-ACCESS-KEY': this.UserConfig.Key,
        'FC-ACCESS-SIGNATURE': signtmp,
        'FC-ACCESS-TIMESTAMP': time,
        'Content-Type': 'application/json;charset=UTF-8',
      },
    }).then(res => res.json()).then(res => {
      if (res.status) return new FcoinApiRes(null, res);
      return res;
    }).catch(e => {
      return new FcoinApiRes(null, { status: 1, e });
    });
  }

  // 查询账户资产
  FetchBalance () {
    const time = Date.now().toString();
    const signtmp = this.secret(`GET${FcoinUrl.balance}${time}`);
    return fetch(FcoinUrl.balance, {
      method: 'GET',
      headers: {
        'FC-ACCESS-KEY': this.UserConfig.Key,
        'FC-ACCESS-SIGNATURE': signtmp,
        'FC-ACCESS-TIMESTAMP': time,
      },
    }).then(res => res.json()).then((res: FcoinApiRes<CoinHas[]>) => {
      if (res.status) return new FcoinApiRes(null, res);
      return res;
    }).catch(e => {
      return new FcoinApiRes(null, { status: 1, e });
    });
  }

  // 查询所有订单
  FetchOrders (symbol: SymbolEnum, states = 'submitted,filled', limit = '100', after = '', before = '') {
    const time = Date.now().toString();
    let url;
    if (before) {
      url = `${FcoinUrl.order}?before=${before}&limit=${limit}&states=${states}&symbol=${symbol}`;
    } else if (after) {
      url = `${FcoinUrl.order}?after=${after}&limit=${limit}&states=${states}&symbol=${symbol}`;
    } else {
      url = `${FcoinUrl.order}?limit=${limit}&states=${states}&symbol=${symbol}`;
    }

    const signtmp = this.secret(`GET${url}${time}`);
    return fetch(url, {
      method: 'GET',
      headers: {
        'FC-ACCESS-KEY': this.UserConfig.Key,
        'FC-ACCESS-SIGNATURE': signtmp,
        'FC-ACCESS-TIMESTAMP': time,
      },
    }).then(res => res.json()).then(res => {
      if (res.status) return new FcoinApiRes(null, res);
      return res;
    }).catch(e => {
      return new FcoinApiRes(null, { status: 1, e });
    });
  }

  // 获取指定 id 的订单
  FetchOrderById (id: string) {
    const time = Date.now().toString();
    const url = `${FcoinUrl.order}/${id}`;
    const signtmp = this.secret(`GET${url}${time}`);
    return fetch(url, {
      method: 'GET',
      headers: {
        'FC-ACCESS-KEY': this.UserConfig.Key,
        'FC-ACCESS-SIGNATURE': signtmp,
        'FC-ACCESS-TIMESTAMP': time,
      },
    }).then(res => res.json()).then((res: FcoinApiRes<OrderResult>) => {
      if (res.status) return new FcoinApiRes(null, res);
      return res;
    }).catch(e => {
      return new FcoinApiRes(null, { status: 1, e });
    });
  }

  /**
   * 行情接口(ticker)
   */
  Ticker (symbol: SymbolEnum) {
    let url = `${FcoinUrl.market_http}/ticker/${symbol}`;
    return fetch(url, {
      method: 'GET',
    }).then(res => res.json()).then((res: FcoinApiRes<{
      ticker: number[];
      seq: number;
      type: string;
    }>) => {
      if (res.status) return new FcoinApiRes(null, res);
      const ticker = res.data.ticker;
      return new FcoinApiRes({
        seq: res.data.seq,
        type: res.data.type,
        LastPrice: ticker[0], // 最新成交价
        LastVolume: ticker[1], // 最近一笔成交量
        MaxBuyPrice: ticker[2], // 最大买一价格
        MaxBuyVolume: ticker[3], // 最大买一量
        MinSalePrice: ticker[4], // 最小卖一价格
        MinSaleVolume: ticker[5], // 最小卖一量
        BeforeH24Price: ticker[6], // 24小时前成交价
        HighestH24Price: ticker[7], // 24小时内最高价
        LowestH24Price: ticker[8], // 24小时内最低价
        OneDayVolume1: ticker[9], // 24小时内基准货币成交量, 如 btcusdt 中 btc 的量
        OneDayVolume2: ticker[10], // 24小时内基准货币成交量, 如 btcusdt 中 usdt 的量
      });
    }).catch(e => {
      return new FcoinApiRes(null, { status: 1, e });
    });
  }

  /**
   * 深度查询
   */
  Depth (symbol: SymbolEnum, deep: DepthLevel) {
    const url = `${FcoinUrl.market_http}/depth/${deep}/${symbol}`;
    return fetch(url, {
      method: 'GET',
    }).then(res => res.json()).then((res: FcoinApiRes<{
      bids: number[];
      asks: number[];
      ts: number;
      seq: number;
      type: string;
    }>) => {
      if (res.status) return new FcoinApiRes(null, res);
      const bids: DepthUnit[] = [];
      const asks: DepthUnit[] = [];
      res.data.bids.forEach((num, index) => {
        const isVol = Boolean(index % 2);
        const realIndex = Math.floor(index / 2);
        if (!isVol) {
          bids.push({ price: num, vol: 0 });
        } else {
          bids[realIndex].vol = num;
        }
      });
      res.data.asks.forEach((num, index) => {
        const isVol = Boolean(index % 2);
        const realIndex = Math.floor(index / 2);
        if (!isVol) {
          asks.push({ price: num, vol: 0 });
        } else {
          asks[realIndex].vol = num;
        }
      });
      return new FcoinApiRes({
        bids, asks,
        seq: res.data.seq,
        ts: res.data.ts,
        type: res.data.type,
      });
    }).catch(e => {
      return new FcoinApiRes(null, { status: 1, e });
    });
  }

  // 工具类
  private tob64 (str: string) {
    return new Buffer(str).toString('base64');
  }

  private secret (str: string) {
    str = this.tob64(str);
    str = crypto.createHmac('sha1', this.UserConfig.Secret).update(str).digest().toString('base64');
    return str;
  }
}
