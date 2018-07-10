export declare class FcoinApi {
    private Config;
    constructor(key: string, secret: string);
    /**
     * 创建订单（买卖）
     */
    OrderCreate(symbol: string, side: 'buy' | 'sell', type: 'limit' | 'market', price: string, amount: string): Promise<FcoinApiRes<string>>;
    /**
     * 撤销订单（买卖）
     */
    OrderCancel(id: string): Promise<any>;
    FetchBalance(): Promise<FcoinApiRes<{
        currency: string;
        category: string;
        available: string;
        frozen: string;
        balance: string;
    }[]>>;
    FetchOrders(symbol: string, states?: string, limit?: string, after?: string, before?: string): Promise<any>;
    FetchOrderById(id: string): Promise<FcoinApiRes<{
        id: string;
        symbol: string;
        type: "limit" | "market";
        side: "buy" | "sell";
        price: string;
        amount: string;
        state: OrderState;
        executed_value: string;
        fill_fees: string;
        filled_amount: string;
        created_at: number;
        source: string;
    }>>;
    /**
     * 行情接口(ticker)
     */
    Ticker(symbol: string): Promise<FcoinApiRes<{
        ticker: number[];
        seq: number;
        type: string;
    }> | FcoinApiRes<{
        seq: number;
        type: string;
        LastPrice: number;
        LastVolume: number;
        MaxBuyPrice: number;
        MaxBuyVolume: number;
        MinSalePrice: number;
        MinSaleVolume: number;
        BeforeH24Price: number;
        HighestH24Price: number;
        LowestH24Price: number;
        OneDayVolume1: number;
        OneDayVolume2: number;
    }>>;
    /**
     * 深度查询
     */
    Depth(depth: string, symbol: string): Promise<FcoinApiRes<{
        bids: number[];
        asks: number[];
        ts: number;
        seq: number;
        type: string;
    }> | FcoinApiRes<{
        bids: DepthValue[];
        asks: DepthValue[];
        seq: number;
        ts: number;
        type: string;
    }>>;
    private tob64;
    private secret;
}
export interface DepthValue {
    Price: number;
    Volume: number;
}
export declare class FcoinApiRes<T> {
    data: T;
    status: number;
    constructor(data: T);
}
/**
 * @param {已提交} submitted
 * @param {部分成交} partial_filled
 * @param {部分成交已撤销} partial_canceled
 * @param {完全成交} filled
 * @param {已撤销} canceled
 * @param {撤销已提交} pending_cancel
 */
export declare enum OrderState {
    submitted = "submitted",
    partial_filled = "partial_filled",
    partial_canceled = "partial_canceled",
    filled = "filled",
    canceled = "canceled",
    pending_cancel = "pending_cancel"
}
