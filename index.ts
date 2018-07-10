import fetch from 'node-fetch';
import crypto from 'crypto';

const API = {
  order: 'https://api.fcoin.com/v2/orders',
  market: 'wss://api.fcoin.com/v2/ws',
  market_http: 'https://api.fcoin.com/v2/market/',
  balance: 'https://api.fcoin.com/v2/accounts/balance',
};

export class FcoinApi {
  private Config = {
    Key: '',
    Secret: '',
  };

  constructor (key: string, secret: string) {
    this.Config.Key = key;
    this.Config.Secret = secret;
  }

  /**
   * 创建订单（买卖）
   */
  async OrderCreate (symbol: string, side: 'buy' | 'sell', type: 'limit' | 'market', price: string, amount: string): Promise<FcoinApiRes<string>> {
    const time = Date.now().toString();
    const signtmp = this.secret(`POST${API.order}${time}amount=${amount}&price=${price}&side=${side}&symbol=${symbol}&type=${type}`);
    return fetch(API.order, {
      method: 'post',
      headers: {
        'FC-ACCESS-KEY': this.Config.Key,
        'FC-ACCESS-SIGNATURE': signtmp,
        'FC-ACCESS-TIMESTAMP': time,
        'Content-Type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify({ type, side, amount, price, symbol }),
    }).then(res => res.json()) as Promise<FcoinApiRes<string>>;
  }

  /**
   * 撤销订单（买卖）
   */
  OrderCancel (id: string) {
    const time = Date.now().toString();
    const url = `${API.order}/${id}/submit-cancel`;
    const signtmp = this.secret(`POST${url}${time}`);

    // 发送新建订单的请求
    return fetch(url, {
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
  FetchBalance () {
    const time = Date.now().toString();
    const signtmp = this.secret(`GET${API.balance}${time}`);
    return fetch(API.balance, {
      method: 'GET',
      headers: {
        'FC-ACCESS-KEY': this.Config.Key,
        'FC-ACCESS-SIGNATURE': signtmp,
        'FC-ACCESS-TIMESTAMP': time,
      },
    }).then(res => res.json()) as Promise<FcoinApiRes<{
      currency: string;
      category: string;
      available: string;
      frozen: string;
      balance: string;
    }[]>>;
  }

  // 查询所有订单
  FetchOrders (symbol: string, states = 'submitted,filled', limit = '100', after = '', before = '') {
    const time = Date.now().toString();
    let url;
    if (before) {
      url = `${API.order}?before=${before}&limit=${limit}&states=${states}&symbol=${symbol}`;
    } else if (after) {
      url = `${API.order}?after=${after}&limit=${limit}&states=${states}&symbol=${symbol}`;
    } else {
      url = `${API.order}?limit=${limit}&states=${states}&symbol=${symbol}`;
    }

    const signtmp = this.secret(`GET${url}${time}`);
    return fetch(url, {
      method: 'GET',
      headers: {
        'FC-ACCESS-KEY': this.Config.Key,
        'FC-ACCESS-SIGNATURE': signtmp,
        'FC-ACCESS-TIMESTAMP': time,
      },
    }).then(res => res.json());
  }

  // 获取指定 id 的订单
  FetchOrderById (id: string) {
    const time = Date.now().toString();
    const url = `${API.order}/${id}`;
    const signtmp = this.secret(`GET${url}${time}`);
    return fetch(url, {
      method: 'GET',
      headers: {
        'FC-ACCESS-KEY': this.Config.Key,
        'FC-ACCESS-SIGNATURE': signtmp,
        'FC-ACCESS-TIMESTAMP': time,
      },
    }).then(res => res.json()) as Promise<FcoinApiRes<{
      id: string;
      symbol: string;
      type: 'limit' | 'market';
      side: 'buy' | 'sell';
      price: string;
      amount: string;
      state: OrderState;
      executed_value: string;
      fill_fees: string;
      filled_amount: string;
      created_at: number;
      source: string;
    }>>;
  }

  /**
   * 行情接口(ticker)
   */
  Ticker (symbol: string) {
    let url = `${API.market_http}/ticker/${symbol}`;
    return fetch(url, {
      method: 'GET',
    }).then(res => res.json()).then((res: FcoinApiRes<{
      ticker: number[];
      seq: number;
      type: string;
    }>) => {
      if (res.status) return res;
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
    });
  }

  /**
   * 深度查询
   */
  Depth (depth: string, symbol: string) {
    const url = `${API.market_http}/depth/${depth}/${symbol}`;
    return fetch(url, {
      method: 'GET',
    }).then(res => res.json()).then((res: FcoinApiRes<{
      bids: number[];
      asks: number[];
      ts: number;
      seq: number;
      type: string;
    }>) => {
      if (res.status) return res;
      const bids: DepthValue[] = [];
      const asks: DepthValue[] = [];
      res.data.bids.forEach((num, index) => {
        const isVol = Boolean(index % 2);
        const realIndex = Math.floor(index / 2);
        if (!isVol) {
          bids.push({ Price: num, Volume: 0 });
        } else {
          bids[realIndex].Volume = num;
        }
      });
      res.data.asks.forEach((num, index) => {
        const isVol = Boolean(index % 2);
        const realIndex = Math.floor(index / 2);
        if (!isVol) {
          asks.push({ Price: num, Volume: 0 });
        } else {
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
  private tob64 (str: string) {
    return new Buffer(str).toString('base64');
  }

  private secret (str: string) {
    str = this.tob64(str);
    str = crypto.createHmac('sha1', this.Config.Secret).update(str).digest().toString('base64');
    return str;
  }
}

export interface DepthValue {
  Price: number;
  Volume: number;
}

export class FcoinApiRes<T> {
  data: T;
  status = 0;
  constructor (data: T) {
    this.data = data;
  }
}

/**
 * @param {已提交} submitted
 * @param {部分成交} partial_filled
 * @param {部分成交已撤销} partial_canceled
 * @param {完全成交} filled
 * @param {已撤销} canceled
 * @param {撤销已提交} pending_cancel
 */
export enum OrderState {
  submitted = 'submitted',
  partial_filled = 'partial_filled',
  partial_canceled = 'partial_canceled',
  filled = 'filled',
  canceled = 'canceled',
  pending_cancel = 'pending_cancel',
}