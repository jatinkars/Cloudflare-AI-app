# cf_ai_edge_chat_memory

Minimal AI chat app on **Cloudflare Workers** using **Workers AI (Llama 3.3)** and **Durable Objects** for per-session memory.

- **LLM**: `@cf/meta/llama-3.3-70b-instruct-fp8-fast` (Workers AI).
- **Workflow / coordination**: a **Durable Object** orchestrates turns and manages memory.
- **User input**: simple **chat UI** served by the Worker.
- **Memory / state**: persisted in the Durable Object's storage (trimmed sliding window).

> ⚠️ You must enable Workers AI and Durable Objects in your Cloudflare account. This repo is intentionally small and focused.

---

## Quick start

1. **Install** prerequisites:

```bash
npm install
```

2. **Configure** your `wrangler.toml` if needed (bindings are already set up). Ensure Workers AI is available in your account/zone.

3. **Dev**:

```bash
npm run dev
```

Open http://localhost:8787

4. **Deploy**:

```bash
npm run deploy
```

The Worker serves both the chat UI and the `/api/chat` endpoint.

---

## How it works

- The Worker serves a static HTML chat UI at `/`.
- User messages POST to `/api/chat` with a `sessionId` (stored in `localStorage`).
- We route the message to the `Session` Durable Object (one instance per session ID) which:
  - Loads the conversation history from **DO storage**.
  - Calls **Workers AI** (`@cf/meta/llama-3.3-70b-instruct-fp8-fast`) with the running transcript.
  - Appends the assistant reply and persists the trimmed history.
- Returning JSON includes `{{ reply, sessionId }}` for the UI to render.

---

## Model

Default model: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`  
You can swap to a smaller model (e.g. `@cf/meta/llama-3.3-8b-instruct`) via `src/session.ts`.

---

## Extending

- **Realtime voice**: Add Cloudflare Realtime for audio/video, or Web Speech API in the UI.
- **RAG**: Fetch relevant context (R2 / KV / Vectorize) before the model call.
- **Moderation**: Add a pre-check step before sending to the model.
- **Workflows**: If you prefer declarative coordination, wire a Cloudflare Workflow that hits your DO and AI.

---

## Files

```
cf_ai_edge_chat_memory/
├─ README.md
├─ PROMPTS.md
├─ wrangler.toml
├─ package.json
├─ tsconfig.json
└─ src/
   ├─ index.ts      # routes + DO binding
   ├─ session.ts    # Durable Object state + AI call
   ├─ types.ts
   └─ ui.ts         # HTML chat UI
```

---

## Running locally without billing surprises

- In dev, model calls route to Workers AI. Ensure the model is available in your account and you're comfortable with pricing.
- Consider swapping to a smaller model for tests.

---

## License

MIT