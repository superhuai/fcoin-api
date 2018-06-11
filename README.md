# fcoin-api
for some people，use api easily

# Installation
```
npm install fcoin-api
```
# Examples
```
const fcoin = require('fcoin-api');

//一定要初始化
fcoin.init({
    key: '',
    secret: ''
})


/**
 * 创建订单（买卖）
 * @param {交易对} symbol 
 * @param {买卖方向} side 
 * @param {现价还是市价} type 
 * @param {价格} price 
 * @param {数量} amount 
 */
fcoin.createOrder(symbol, side, type, price, amount).then(data => {})
// 撤销订单（买卖）
/**
 * 
 * @param {订单id} id 
 */
fcoin.cancelOrder(id).then(data => {})
// 查询账户资产
fcoin.getBalance().then(data => {})

/**
 * 查询所有订单
 * @param {交易对} symbol  'submitted,filled'
 * @param {订单状态} states 
 * @param {每页限制数量} limit 
 */
fcoin.getOrders(symbol, states, limit).then(data => {})

/**
 * 获取指定 id 的订单 
 * @param {订单id} id 
 */
fcoin.getOrderByid(id).then(data => {})