// src/index.ts
// Minimal chat app on Cloudflare Workers + Workers AI with Durable Object memory.
import { handleUI } from "./ui";
import { Env, ChatRequest } from "./types";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
      return handleUI();
    }
    if (url.pathname === "/api/chat" && request.method === "POST") {
      const body = (await request.json()) as ChatRequest;
      if (!body?.message) return new Response("Missing 'message'", { status: 400 });
      const sessionId = body.sessionId || crypto.randomUUID();

      // Route to the session Durable Object for memory and coordination.
      const id = env.SESSION.idFromName(sessionId);
      const stub = env.SESSION.get(id);
      const resp = await stub.fetch("https://session/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: body.message, sessionId }),
      });
      return resp;
    }
    return new Response("Not found", { status: 404 });
  },
};

// Durable Object exported separately
export { Session } from "./session";