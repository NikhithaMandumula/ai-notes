import { createGroq } from '@ai-sdk/groq';

let instance = null;

export function getGroq() {
  if (!instance) {
    instance = createGroq({ apiKey: process.env.GROQ_API_KEY });
  }
  return instance;
}
