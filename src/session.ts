// src/session.ts
// Durable Object that holds conversation state and calls Workers AI.
import { Env } from "./types";

type Turn = { role: "user" | "assistant" | "system"; content: string };

export class Session {
  state: DurableObjectState;
  env: Env;
  history: Turn[];

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.history = [];
  }

  async fetch(request: Request) {
    const url = new URL(request.url);
    if (url.pathname !== "/chat" || request.method !== "POST") {
      return new Response("Not found", { status: 404 });
    }
    const { message, sessionId } = await request.json() as { message: string; sessionId: string };

    // Load history from storage (persisted between cold starts)
    if (this.history.length === 0) {
      const stored = await this.state.storage.get<Turn[]>("history");
      if (stored) this.history = stored;
      else {
        this.history = [{ role: "system", content: "You are a friendly, concise assistant. Keep answers short and helpful." }];
      }
    }

    this.history.push({ role: "user", content: message });

    // Call Workers AI (Llama 3.3). See README for model options.
    const model = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
    const aiResponse = await (this.env as any).AI.run(model, {
      messages: this.history.map(t => ({ role: t.role, content: t.content })),
      // You can enable function/tool calling or set temperature here
      temperature: 0.3,
      max_output_tokens: 512
    } as any);

    const reply = aiResponse.response ?? aiResponse.output_text ?? "Sorry, I couldn't think of a reply.";

    this.history.push({ role: "assistant", content: reply });

    // Save trimmed history to bound memory
    const MAX_TURNS = 20;
    if (this.history.length > MAX_TURNS) {
      // Keep system + last turns
      const system = this.history.find(t => t.role === "system");
      this.history = [system!, ...this.history.slice(-MAX_TURNS)];
    }
    await this.state.storage.put("history", this.history);

    return new Response(JSON.stringify({ sessionId, reply }), {
      headers: { "Content-Type": "application/json" },
    });
  }
}