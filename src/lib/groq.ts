import "server-only";

import Groq from "groq-sdk";

let groqClient: Groq | undefined;

export function getGroqServer(): Groq {
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY environment variable.");
  }

  if (!groqClient) {
    groqClient = new Groq({ apiKey });
  }

  return groqClient;
}

export function getGroqModel() {
  return process.env.GROQ_MODEL?.trim() || "openai/gpt-oss-20b";
}
