import { type Server } from "http";
import { WebSocketServer } from "ws";

type BroadcastFn = (type: string, payload: unknown) => void;

let wss: WebSocketServer | null = null;
let _broadcast: BroadcastFn = () => {};

export function broadcast(type: string, payload: unknown) {
  _broadcast(type, payload);
}

export function initRealtime(server: Server) {
  if (wss) return wss;

  wss = new WebSocketServer({ server, path: "/ws" }) as any;
  wss.on("connection", (socket) => {
    try {
      const remote = (socket as any)._socket?.remoteAddress || "unknown";
      console.log(`Realtime: client connected from ${remote}`);
    } catch {}

    socket.on("message", () => {
      // no-op for now; clients are read-only listeners
    });

    socket.on("close", () => {
      try {
        const remote = (socket as any)._socket?.remoteAddress || "unknown";
        console.log(`Realtime: client disconnected ${remote}`);
      } catch {}
    });
  });

  _broadcast = (type: string, payload: unknown) => {
    if (!wss) return;
    const msg = JSON.stringify({ type, payload });
    for (const client of (wss as any).clients) {
      if ((client as any).readyState === 1) {
        (client as any).send(msg);
      }
    }
  };

  return wss;
}

export default initRealtime;
