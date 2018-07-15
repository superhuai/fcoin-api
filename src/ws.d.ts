import { SymbolEnum, WsResponseTicker, DepthLevel, WsResponseDepth, WsResponseTrade, CandleResolution, WsResponseCandle } from './types';
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
export declare class FcoinWebSocket {
    private ws;
    private typeListen;
    constructor();
    /**
     * 监听交易对的数据
     */
    OnTicker(symbol: SymbolEnum, fun: (data: WsResponseTicker) => any): void;
    /**
     * 深度信息变更
     */
    OnDepth(symbol: SymbolEnum, level: DepthLevel | undefined, fun: (data: WsResponseDepth) => any): void;
    /**
     * 交易记录
     */
    OnTrade(symbol: SymbolEnum, limit: number | undefined, fun: (data: WsResponseTrade) => any): void;
    /**
     * 历史数据
     */
    OnCandle(symbol: SymbolEnum, resolution: CandleResolution | undefined, fun: (data: WsResponseCandle) => any): void;
    private On;
    /**
     * 监听ws返回的数据
     */
    private Listen;
    private TopicCallback;
}
