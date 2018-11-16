import WebSocket from 'ws';
import { SymbolEnum, WsResponse, BrocastType, WatchTicker, WsResponseTicker, DepthLevel, WsResponseDepth, WsResponseTrade, CandleResolution, WsResponseCandle, DepthUnit } from './types';
import { FcoinUrl } from '.';

/**
 * topic 表示订阅的主题
 * symbol 表示对应交易币种. 所有币种区分的 topic 都在 topic 末尾.
 * ticker 行情 tick 信息, 包含最新成交价, 最新成交量, 买一卖一, 近 24 小时成交量.
 * depth 表示行情深度, 买卖盘, 盘口.
 * level 表示行情深度类型. 如 L20, L100.
 * trade 表示最新成交, 最新交易.
 * candle 表示蜡烛图, 蜡烛棒, K 线.
 * resolution 表示蜡烛图的种类. 如 M1, M15.
 * base volume 表示基准货币成交量, 如 btcusdt 中 btc 的量.
 * quote volume 表示计价货币成交量, 如 btcusdt 中 usdt 的量
 * ts 表示推送服务器的时间. 是毫秒为单位的数字型字段, unix epoch in millisecond.
 * {"cmd":"sub","args":["all-tickers"]}
 * {"cmd":"sub","args":["depth.L20.ftusdt"]}
 * {"cmd":"sub","args":["ticker.ftusdt"]}
 * {"cmd":"req","args":["trade.ftusdt",40],"id":"trade-history"}
 * {"cmd":"sub","args":["trade.ftusdt"]}
 * {"cmd":"ping","args":[1531375817736]}
 */

export class FcoinWebSocket {
  private ws: WebSocket;
  private typeListen: { [index: string]: WatchTicker<any>[] } = {};
  private wsOpen!: Promise<any>;

  // 最后一次呼吸返回
  public LastHeartbeat = {
    id: '',
    type: 'ping',
    ts: Date.now(),
    gap: 0,
  };

  constructor () {
    this.ws = new WebSocket(FcoinUrl.market);
    this.wsOpen = new Promise(resolve => {
      this.ws.on('open', resolve);
    });
    setInterval(() => this.Heartbeat(), 3000);
    this.Listen();
  }

  async Heartbeat () {
    await this.wsOpen;
    this.ws.send(JSON.stringify({ cmd: 'ping', args: [Date.now()], id: `${Date.now()}` }));
  }

  /**
   * 监听交易对的数据
   */
  OnTicker (symbol: SymbolEnum, fun: (data: WsResponseTicker) => any) {
    this.On((data: any) => {
      const ticker = data.ticker;
      fun({
        type: data.type,
        ts: data.ts,
        seq: data.seq,
        ticker: {
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
        },
      });
    }, `ticker.${symbol}`);
  }

  /**
   * 深度信息变更
   */
  OnDepth (symbol: SymbolEnum, level = DepthLevel.L20, fun: (data: WsResponseDepth) => any) {
    this.On((data: any) => {
      const asks: DepthUnit[] = [];
      const bids: DepthUnit[] = [];
      data.bids.forEach((num: number, index: number) => {
        const isVol = Boolean(index % 2);
        const realIndex = Math.floor(index / 2);
        if (!isVol) {
          bids.push({ price: num, vol: 0 });
        } else {
          bids[realIndex].vol = num;
        }
      });
      data.asks.forEach((num: number, index: number) => {
        const isVol = Boolean(index % 2);
        const realIndex = Math.floor(index / 2);
        if (!isVol) {
          asks.push({ price: num, vol: 0 });
        } else {
          asks[realIndex].vol = num;
        }
      });
      fun({
        type: data.type,
        ts: data.ts,
        seq: data.seq,
        asks,
        bids,
      });
    }, `depth.${level}.${symbol}`);
  }

  /**
   * 交易记录
   */
  OnTrade (symbol: SymbolEnum, limit = '20', fun: (data: WsResponseTrade) => any) {
    this.On(fun, `trade.${symbol}`, limit);
  }

  /**
   * 历史数据
   */
  OnCandle (symbol: SymbolEnum, resolution = CandleResolution.M1, fun: (data: WsResponseCandle) => any) {
    this.On(fun, `candle.${resolution}.${symbol}`);
  }

  private async On (callback: WatchTicker<any>, ...topics: any[]) {
    await this.wsOpen;
    const name = topics[0];
    if (this.typeListen[name]) {
      this.typeListen[name].push(callback);
      return;
    }
    this.typeListen[name] = [];
    this.typeListen[name].push(callback);
    this.ws.send(JSON.stringify({ cmd: 'sub', args: topics }));
  }

  /**
   * 监听ws返回的数据
   */
  private Listen () {
    this.ws.on('message', (msg) => {
      try {
        const data = JSON.parse(msg.toString()) as WsResponse;
        // logger.trace(`ws ${data.type}:`, data);
        switch (data.type) {
          case BrocastType.hello: break;
          case BrocastType.ping: this.LastHeartbeat = data as any; break;
          case BrocastType.topics:
            // logger.info('订阅成功', data);
            break;
          default: this.TopicCallback(data); break;
        }
      } catch (e) {
        // loggerError.error(msg, e);
        return;
      }
    });

    this.ws.on('error', (errs) => {
      // if (errs) loggerError.error(errs);
    });
  }

  private TopicCallback (data: WsResponse) {
    const listen = this.typeListen[data.type];
    if (!listen) {
      // logger.error('未处理的消息', data);
      return;
    }
    listen.forEach(fun => fun(data));
  }

  Close () {
    this.ws.close();
    delete this.ws;
  }
}
