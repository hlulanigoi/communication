import { QueryClient } from "@tanstack/react-query";

let socket: WebSocket | null = null;

export function initRealtimeClient(queryClient: QueryClient) {
  if (socket) return socket;

  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const host = window.location.host;

  function connect() {
    socket = new WebSocket(`${protocol}://${host}/ws`);

    socket.addEventListener("open", () => {
      console.log("Realtime connected");
    });

    socket.addEventListener("message", (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        const payload = msg.payload as any;

        if (msg.type === "job.created") {
          // prepend new job to cached list
          queryClient.setQueryData(["jobs"], (old: any) => {
            try {
              if (!old) return [payload];
              // avoid duplicate if already present
              if (Array.isArray(old) && old.some((j: any) => j.id === payload.id)) return old;
              return [payload, ...old];
            } catch {
              return old;
            }
          });
          if (payload && payload.id) {
            queryClient.setQueryData(["/api/jobs", payload.id], payload);
          }
        }

        if (msg.type === "job.updated") {
          queryClient.setQueryData(["jobs"], (old: any) => {
            try {
              if (!Array.isArray(old)) return old;
              return old.map((j: any) => (j.id === payload.id ? payload : j));
            } catch {
              return old;
            }
          });
          if (payload && payload.id) {
            queryClient.setQueryData(["/api/jobs", payload.id], payload);
          }
        }
      } catch (e) {
        console.warn("Invalid realtime message", e);
      }
    });

    socket.addEventListener("close", () => {
      console.log("Realtime disconnected, reconnecting in 3s");
      socket = null;
      setTimeout(() => connect(), 3000);
    });

    socket.addEventListener("error", (err) => {
      console.warn("Realtime socket error", err);
      try {
        socket?.close();
      } catch {}
      socket = null;
    });
  }

  connect();

  return socket;
}

export default initRealtimeClient;
