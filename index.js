const fetch = require('node-fetch');
const crypto = require('crypto');

const API = {
  order: "https://api.fcoin.com/v2/orders",
  market: "wss://api.fcoin.com/v2/ws"
}
// Util Func
function tob64(str){
  return new Buffer(str).toString('base64')
}
function secret(str){
  str = tob64(str);
  str = crypto.createHmac('sha1', config.secret).update(str).digest().toString('base64');
  return str;
}

let Fcoin = {};

let config = {
  key: '',
  secret: ''
}


// Init config
Fcoin.init = cfg => {
  config = cfg;
}

/**
 * 创建订单（买卖）
 * @param {交易对} symbol 
 * @param {买卖方向} side 
 * @param {现价还是市价} type 
 * @param {价格} price 
 * @param {数量} amount 
 */
Fcoin.createOrder = (symbol, side, type = 'limit', price, amount = 0.01) => {
  let time = Date.now();
  let signtmp = secret(`POST${API.order}${time}amount=${amount}&price=${price}&side=${side}&symbol=${symbol}&type=${type}`);

  // 发送新建订单的请求
  return fetch(API.order, {
    method: 'post',
    headers: {
      'FC-ACCESS-KEY': config.key,
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
Fcoin.cancelOrder = (id) => {
  let time = Date.now();
  let url = `${API.order}/${id}/submit-cancel`;
  let signtmp = secret(`POST${url}${time}`);

  // 发送新建订单的请求
  return fetch(url, {
    method: 'post',
    headers: {
      'FC-ACCESS-KEY': config.key,
      'FC-ACCESS-SIGNATURE': signtmp,
      'FC-ACCESS-TIMESTAMP': time,
      'Content-Type': 'application/json;charset=UTF-8'
    }

  }).then(res => res.json())
}
// 查询账户资产
Fcoin.getBalance = () => {
  let time = Date.now();
  let signtmp = secret(`GEThttps://api.fcoin.com/v2/accounts/balance${time}`)
  return fetch('https://api.fcoin.com/v2/accounts/balance', {
    method: 'GET',
    headers: {
      'FC-ACCESS-KEY': config.key,
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
 * @param {每页限制数量} limit 
 */
Fcoin.getOrders = (symbol, states = 'submitted,filled', limit = 100) => {
  let time = Date.now();
  let url = `${API.order}?limit=${limit}&states=${states}&symbol=${symbol}`;
  let signtmp = secret(`GET${url}${time}`)
  return fetch(url, {
    method: 'GET',
    headers: {
      'FC-ACCESS-KEY': config.key,
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
Fcoin.getOrderByid = (id) => {
  let time = Date.now();
  let url = `${API.order}/${id}`;
  let signtmp = secret(`GET${url}${time}`)
  return fetch(url, {
    method: 'GET',
    headers: {
      'FC-ACCESS-KEY': config.key,
      'FC-ACCESS-SIGNATURE': signtmp,
      'FC-ACCESS-TIMESTAMP': time
    }
  }).then(res => res.json())
  
}

module.exports = Fcoin;
