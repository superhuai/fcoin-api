# Fcoin-api
For some people，use api easily！

脱胎于[官方文档](https://developer.fcoin.com/zh.html)
fork于[fcoin-api](https://github.com/superhuai/fcoin-api)

# Installation
```
npm install fcoin-nodejs-api
```
# Examples
```ts
import { FcoinWebSocket, FcoinApi } from 'fcoin-nodejs-api';

const ws = new FcoinWebSocket();
const api = new FcoinApi('your-key', 'your-secret');

ws.OnTicker('ftusdt', (data) => {
    console.log(data);
});

api.FetchBalance().then(console.log);
```
