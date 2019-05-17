const fetchBase = require('node-fetch');
const crypto = require('crypto');
const HttpsProxyAgent = require('https-proxy-agent');

const API = {
  order: "https://api.fcoin.com/v2/orders",
  market: "wss://api.fcoin.com/v2/ws",
  market_http: "https://api.fcoin.com/v2/market",
  balance: "https://api.fcoin.com/v2/accounts/balance"
}
// Util Func

class Fcoin {
  constructor(obj) {
    this.config = obj;
  }
  getconfig() {
    console.log(this.config);
  }
  // 包装 fetch ，提供以代理请求的功能
  fetch(url, obj){
    if (this.config.proxy) {
      obj.agent = new HttpsProxyAgent(this.config.proxy)
    }
    return fetchBase(url, obj)
  }
  // 工具类
  tob64(str) {
    return new Buffer(str).toString('base64')
  }
  secret(str) {
    str = this.tob64(str);
    str = crypto.createHmac('sha1', this.config.secret).update(str).digest().toString('base64');
    return str;
  }
  /**
   * 创建订单（买卖）
   * @param {交易对} symbol 
   * @param {买卖方向} side 
   * @param {现价还是市价} type 
   * @param {价格, string} price 
   * @param {数量, string} amount 
   */
  createOrder(symbol, side, type = 'limit', price, amount = 0.01) {
    let time = Date.now();
    let signtmp = this.secret(`POST${API.order}${time}amount=${amount}&price=${price}&side=${side}&symbol=${symbol}&type=${type}`);

    // 发送新建订单的请求
    return this.fetch(API.order, {
      method: 'post',
      headers: {
        'FC-ACCESS-KEY': this.config.key,
        'FC-ACCESS-SIGNATURE': signtmp,
        'FC-ACCESS-TIMESTAMP': time,
        'Content-Type': 'application/json;charset=UTF-8'
      },
      body: JSON.stringify({
        "type": type,
        "side": side,
        "amount": amount,
        "price": price,
        "symbol": symbol
      })

    }).then(res => res.json())

  }
  // 撤销订单（买卖）
  /**
   * 
   * @param {订单id} id 
   */
  cancelOrder(id) {
    let time = Date.now();
    let url = `${API.order}/${id}/submit-cancel`;
    let signtmp = this.secret(`POST${url}${time}`);

    // 发送新建订单的请求
    return this.fetch(url, {
      method: 'post',
      headers: {
        'FC-ACCESS-KEY': this.config.key,
        'FC-ACCESS-SIGNATURE': signtmp,
        'FC-ACCESS-TIMESTAMP': time,
        'Content-Type': 'application/json;charset=UTF-8'
      }

    }).then(res => res.json())
  }
  // 查询账户资产
  getBalance() {
    let time = Date.now();
    let signtmp = this.secret(`GET${API.balance}${time}`)

    return this.fetch(API.balance, {
      method: 'GET',
      headers: {
        'FC-ACCESS-KEY': this.config.key,
        'FC-ACCESS-SIGNATURE': signtmp,
        'FC-ACCESS-TIMESTAMP': time
      }
    }).then(res => res.json())

  }
  // 查询所有订单
  /**
   * 
   * @param {交易对} symbol 
   * @param {订单状态} states 
   * @param {每页限制数量, string} limit 
   * @param {在某个时间戳之后, string} after 
   * @param {在某个时间戳之前, string} before 
   */
  getOrders(symbol, states = 'submitted,filled', limit = '100', after = "", before = "") {
    let time = Date.now();
    let url;
    if (before) {
      url = `${API.order}?before=${before}&limit=${limit}&states=${states}&symbol=${symbol}`;
    } else if (after) {
      url = `${API.order}?after=${after}&limit=${limit}&states=${states}&symbol=${symbol}`;
    } else {
      url = `${API.order}?limit=${limit}&states=${states}&symbol=${symbol}`;
    }

    let signtmp = this.secret(`GET${url}${time}`)
    return this.fetch(url, {
      method: 'GET',
      headers: {
        'FC-ACCESS-KEY': this.config.key,
        'FC-ACCESS-SIGNATURE': signtmp,
        'FC-ACCESS-TIMESTAMP': time
      }
    }).then(res => res.json())

  }
  // 获取指定 id 的订单 
  /**
   * 
   * @param {订单id} id 
   */
  getOrderByid(id) {
    let time = Date.now();
    let url = `${API.order}/${id}`;
    let signtmp = this.secret(`GET${url}${time}`)
    return this.fetch(url, {
      method: 'GET',
      headers: {
        'FC-ACCESS-KEY': this.config.key,
        'FC-ACCESS-SIGNATURE': signtmp,
        'FC-ACCESS-TIMESTAMP': time
      }
    }).then(res => res.json())

  }
  /**
   * 行情接口(ticker)
   * @param {交易对} symbol 
   */
  getTicker(symbol) {

    let url = `${API.market_http}/ticker/${symbol}`;

    return this.fetch(url, {
      method: 'GET'
    }).then(res => res.json())

  }
  /**
   * 深度查询
   * @param {L20 default} deep 
   * @param {交易对} symbol 
   */
  getDepth(deep, symbol) {

    let url = `${API.market_http}/depth/${deep}/${symbol}`;
  
    return this.fetch(url, {
      method: 'GET'
    }).then(res => res.json())

  }
}

module.exports = Fcoin;
