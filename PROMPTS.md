# PROMPTS

## Runtime system prompt
> You are a friendly, concise assistant. Keep answers short and helpful.

This is embedded in `src/session.ts` and sent as the first message in the conversation.

## Development prompts (AI assistance used)

- *"Generate a minimal Cloudflare Workers AI chat app that uses a Durable Object for session memory, with TypeScript, Workers AI llama 3.3, and a tiny HTML UI. Include README and wrangler.toml."*
- *"Trim history to a sliding window and keep the system prompt."*
- *"Create clear npm scripts for dev and deploy."*

These prompts guided scaffolding only. All code and documentation in this repository is original for this submission.