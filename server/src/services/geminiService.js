const ai = require('../config/gemini');
const logger = require('../utils/logger');
const { GEMINI_API_KEY } = require('../config/env');

const MODELS = ['gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-3.8-flash'];
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 3000; // 3 seconds base, exponential backoff applied
const CALL_TIMEOUT_MS = 60000; // 60 seconds (1 min) — JSON mode responds much faster

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Gemini API timed out after ${ms / 1000}s`)), ms)
    ),
  ]);
}

/**
 * Calculate exponential backoff delay with jitter.
 * When rate-limited (429), uses longer delays so the sliding 60-second window can clear.
 * @param {number} attempt - Current attempt number (1-indexed)
 * @param {boolean} isRateLimit - Whether this is a 429 rate limit
 * @param {string} errorMsg - Raw error message to check for explicit retry times
 * @returns {number} Delay in milliseconds
 */
function getBackoffDelay(attempt, isRateLimit = false, errorMsg = '') {
  // If the API error specifies a retry duration, follow it
  const match = (errorMsg || '').match(/retry(?: after| in)? (\d+(?:\.\d+)?)\s*s/i);
  if (match) {
    return Math.ceil(parseFloat(match[1])) * 1000 + 1500;
  }

  if (isRateLimit) {
    // Free tier: 15 requests/minute. If rate limit hits, wait for the window to clear.
    // attempt 1: ~8s, attempt 2: ~15s, attempt 3: ~22s
    const rateLimitDelay = 8000 + (attempt - 1) * 7000;
    const jitter = Math.random() * 2000;
    return Math.min(rateLimitDelay + jitter, 35000);
  }

  const exponentialDelay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
  const jitter = Math.random() * 1000;
  return Math.min(exponentialDelay + jitter, 30000);
}

/**
 * Extract a human-readable error message from Gemini SDK errors.
 * The new @google/genai SDK may throw errors with JSON bodies.
 */
function extractErrorInfo(err) {
  const msg = err.message || '';
  const status = err.status || err.httpStatusCode || 0;
  
  // Try to parse JSON error body from the message
  let parsedMsg = msg;
  try {
    const jsonBody = JSON.parse(msg);
    if (jsonBody?.error?.message) {
      parsedMsg = jsonBody.error.message;
    }
  } catch {
    // Not JSON, use as-is
  }

  const combined = `${parsedMsg} ${status}`.toLowerCase();
  
  return {
    message: parsedMsg,
    status,
    isRateLimit: combined.includes('429') || combined.includes('quota') || combined.includes('too many requests') || combined.includes('resource_exhausted'),
    isOverloaded: combined.includes('503') || combined.includes('service unavailable') || combined.includes('high demand') || combined.includes('unreachable') || combined.includes('unavailable') || combined.includes('enotfound') || combined.includes('econnreset') || combined.includes('fetch failed'),
    isAuthError: combined.includes('unauthenticated') || combined.includes('401') || combined.includes('invalid api key') || combined.includes('api_key_invalid'),
    isQuotaZero: combined.includes('limit: 0'),
    isTimeout: parsedMsg.toLowerCase().includes('timed out') || combined.includes('deadline_exceeded'),
    isNotFoundOrDeprecated: combined.includes('404') || combined.includes('not_found') || combined.includes('no longer available') || combined.includes('not found'),
  };
}

const GeminiService = {
  /**
   * Send images + prompt to Gemini Vision API for evaluation.
   * @param {string} prompt - The evaluation prompt text
   * @param {Array<{type: string, data: string}>} images - Base64 encoded images
   * @returns {string} Raw text response from Gemini
   */
  async evaluate(prompt, images = []) {
    // Validate API key
    if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === '') {
      throw new Error('GEMINI_API_KEY is not configured. Please add it to your .env file.');
    }

    if (GEMINI_API_KEY.length < 20) {
      throw new Error('GEMINI_API_KEY appears to be invalid (too short). Please check your .env file.');
    }

    // Build contents array for the new SDK
    const parts = [];

    // Add images as inline data
    for (const img of images) {
      parts.push({
        inlineData: {
          mimeType: img.type,
          data: img.data,
        },
      });
    }

    // Add text prompt
    parts.push({ text: prompt });

    logger.info(`Sending ${images.length} image(s) + prompt (${prompt.length} chars) to Gemini`);
    const startTime = Date.now();

    // Try each model with retries
    for (const modelName of MODELS) {
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          logger.info(`Trying ${modelName} (attempt ${attempt}/${MAX_RETRIES})...`);

          // New @google/genai SDK: use ai.models.generateContent()
          const result = await withTimeout(
            ai.models.generateContent({
              model: modelName,
              contents: [{ role: 'user', parts }],
              config: {
                temperature: 0.2,          // Low creativity for consistent grading
                maxOutputTokens: 4096,      // Cap output — structured JSON doesn't need more
                responseMimeType: 'application/json', // Native JSON mode — faster, no markdown wrapping
              },
            }),
            CALL_TIMEOUT_MS
          );

          // New SDK: response.text is a property, not a function
          const text = result.text;

          if (!text || text.trim() === '') {
            throw new Error('Empty response from Gemini. The model may have rejected the input.');
          }

          logger.info(`Gemini response received (model: ${modelName}, ${text.length} chars, ${((Date.now() - startTime) / 1000).toFixed(1)}s)`);
          logger.debug(`Response preview: ${text.substring(0, 200)}...`);
          
          return text;
        } catch (err) {
          const errInfo = extractErrorInfo(err);

          logger.warn(`Gemini error on ${modelName} attempt ${attempt}: ${errInfo.message.substring(0, 300)}`);

          if (errInfo.isAuthError) {
            throw new Error(`Gemini API authentication failed. Check your GEMINI_API_KEY in .env file.`);
          }

          // If quota is completely zero, don't waste time retrying — fail fast
          if (errInfo.isQuotaZero) {
            logger.error(`API quota is ZERO for ${modelName}. Trying next model immediately...`);
            break;
          }

          // Timeouts, rate limits, and overload are all retryable
          if ((errInfo.isRateLimit || errInfo.isOverloaded || errInfo.isTimeout) && attempt < MAX_RETRIES) {
            const delayMs = errInfo.isTimeout ? 3000 : getBackoffDelay(attempt, errInfo.isRateLimit, errInfo.message);
            const reason = errInfo.isTimeout ? 'Timeout' : errInfo.isOverloaded ? 'Overloaded / Unavailable' : 'Rate limited (429)';
            logger.warn(`${reason}. Retrying in ${Math.round(delayMs / 1000)}s (attempt ${attempt}/${MAX_RETRIES})...`);
            await sleep(delayMs);
            continue;
          }

          if (errInfo.isRateLimit || errInfo.isOverloaded || errInfo.isTimeout) {
            const reason = errInfo.isTimeout ? 'Timed out' : errInfo.isOverloaded ? 'Overloaded' : 'Rate limited';
            logger.warn(`${reason} on ${modelName} after ${MAX_RETRIES} attempts, trying next model...`);
            if (errInfo.isRateLimit) {
              // Wait 5s before switching to avoid hammering the next model while project quota resets
              await sleep(5000);
            }
            break;
          }

          if (errInfo.isNotFoundOrDeprecated) {
            logger.warn(`Model ${modelName} is deprecated or unavailable (${errInfo.message.substring(0, 150)}). Trying next model...`);
            break;
          }

          // Non-retryable error, throw immediately
          throw new Error(`Gemini API error: ${errInfo.message.substring(0, 200)}`);
        }
      }
    }

    throw new Error('All Gemini models exhausted. Your API quota may be exceeded. Please check your billing at https://ai.google.dev or try again later.');
  },

  /**
   * Extract questions from a question paper image.
   */
  async extractQuestions(images, prompt) {
    return this.evaluate(prompt, images);
  },
};

module.exports = GeminiService;
