// ollie/groq.client.js
// Centralised Groq client — import this everywhere instead of re-initialising
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Model aliases — swap here if Groq changes model names
const MODELS = {
  fast: "llama-3.1-8b-instant",      // quiz generation, quick tasks
  smart: "llama-3.3-70b-versatile",   // explanations, timetable reasoning
};

/**
 * Core send function — all Groq calls go through here
 * @param {string} model - "fast" | "smart"
 * @param {Array}  messages - [{role, content}]
 * @param {number} maxTokens
 * @param {boolean} jsonMode - if true, forces JSON response format
 */
async function chat(model, messages, maxTokens = 800, jsonMode = false) {
  const params = {
    model: MODELS[model] || MODELS.smart,
    messages,
    max_tokens: maxTokens,
    temperature: 0.3, // low temperature = more predictable, less hallucination
  };

  if (jsonMode) {
    params.response_format = { type: "json_object" };
  }

  const completion = await groq.chat.completions.create(params);
  return completion.choices[0]?.message?.content || "";
}

module.exports = { chat, MODELS };