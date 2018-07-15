import { SymbolEnum, SideEnum, DepthLevel, DepthUnit, FcoinApiRes, CoinHas, OrderResult } from './types';
export declare class FcoinApi {
    private UserConfig;
    constructor(key: string, secret: string);
    /**
     * 创建订单（买卖）
     */
    OrderCreate(symbol: SymbolEnum, side: SideEnum, type: string | undefined, price: string, amount: string): Promise<FcoinApiRes<null> | FcoinApiRes<string>>;
    /**
     * 撤销订单（买卖）
     */
    OrderCancel(id: string): Promise<any>;
    FetchBalance(): Promise<FcoinApiRes<null> | FcoinApiRes<CoinHas[]>>;
    FetchOrders(symbol: SymbolEnum, states?: string, limit?: string, after?: string, before?: string): Promise<any>;
    FetchOrderById(id: string): Promise<FcoinApiRes<null> | FcoinApiRes<OrderResult>>;
    /**
     * 行情接口(ticker)
     */
    Ticker(symbol: SymbolEnum): Promise<FcoinApiRes<null> | FcoinApiRes<{
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
    Depth(symbol: SymbolEnum, deep: DepthLevel): Promise<FcoinApiRes<null> | FcoinApiRes<{
        bids: DepthUnit[];
        asks: DepthUnit[];
        seq: number;
        ts: number;
        type: string;
    }>>;
    private tob64;
    private secret;
}
