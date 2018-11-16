import { FcoinWebSocket } from '../src/ws';

console.log(1111);
const ws = new FcoinWebSocket();

ws.Heartbeat();

setInterval(() => console.log(ws.LastHeartbeat), 3000);
