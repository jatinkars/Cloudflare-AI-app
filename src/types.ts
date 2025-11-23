// src/types.ts
export type Env = {
  AI: Ai; // Workers AI binding
  SESSION: DurableObjectNamespace;
};

export type ChatRequest = {
  message: string;
  sessionId?: string;
};

// Minimal declaration to avoid importing full workers types
export type Ai = {
  run: (model: string, input: Record<string, unknown>) => Promise<any>;
};

export {}; // ensure module