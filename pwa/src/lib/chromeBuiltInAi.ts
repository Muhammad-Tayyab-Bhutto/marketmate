/**
 * Chrome Built-in AI API Shim
 *
 * This module provides a shim layer for Chrome's Built-in AI APIs.
 * When the official Chrome Built-in AI client library is available,
 * replace the mock implementations below with actual chrome.ai.* calls.
 *
 * Expected API surface:
 * - chrome.ai.prompt() - Multimodal prompt API for image + text analysis
 * - chrome.ai.writer() - Content generation API
 * - chrome.ai.rewriter() - Content rewriting with tone/style variants
 * - chrome.ai.proofreader() - Grammar and spelling correction
 * - chrome.ai.summarizer() - Text summarization
 * - chrome.ai.translator() - Translation API
 *
 * All functions return Promises and should work offline when using
 * chrome.ai/gemini-nano model.
 */

export interface ImageData {
  data: string; // Base64 encoded image
  mimeType: string;
}

export interface VoiceData {
  data: string; // Base64 encoded audio (WAV/WebM)
  mimeType: string;
  transcript?: string; // Optional pre-transcribed text
}

export interface ProductFacts {
  category: string;
  brand?: string;
  color?: string;
  condition: string;
  uniqueFeatures: string[];
  keywords: string[];
  estimatedPrice?: number;
  notes?: string;
}

export interface ListingContent {
  title: string;
  description: string;
  keywords: string[];
  suggestedPrice?: number;
}

export interface ToneVariant {
  tone: "friendly" | "premium" | "bargain";
  title: string;
  description: string;
}

export interface VideoScript {
  script: string; // 15-30 second video script
  duration: number; // Estimated duration in seconds
  keyPoints: string[];
}

/**
 * Extract product facts from images and optional voice note
 * Uses: chrome.ai.prompt() with multimodal input
 *
 * TO REPLACE: Replace the fetch call with:
 *   const result = await chrome.ai.prompt({
 *     model: 'chrome.ai/gemini-nano',
 *     messages: [{
 *       role: 'user',
 *       content: [
 *         { type: 'text', text: promptText },
 *         ...images.map(img => ({ type: 'image', image: img.data })),
 *         voiceData ? { type: 'audio', audio: voiceData.data } : null
 *       ].filter(Boolean)
 *     }]
 *   });
 */
export async function generateFactsFromImageAndVoice(
  _images: ImageData[],
  voiceData?: VoiceData
): Promise<ProductFacts> {
  // TODO: Replace with chrome.ai.prompt() call
  // Mock implementation for development
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        category: "Electronics",
        brand: "Generic",
        color: "Black",
        condition: "Good",
        uniqueFeatures: ["Portable", "Lightweight"],
        keywords: ["electronics", "portable", "black"],
        estimatedPrice: 50,
        notes: voiceData?.transcript || "No voice notes provided",
      });
    }, 1000);
  });
}

/**
 * Generate SEO-friendly title, description, and keywords
 * Uses: chrome.ai.writer() for content generation
 *
 * TO REPLACE: Replace with:
 *   const result = await chrome.ai.writer({
 *     model: 'chrome.ai/gemini-nano',
 *     prompt: promptText,
 *     format: 'structured',
 *     schema: { title: 'string', description: 'string', keywords: 'array' }
 *   });
 */
export async function generateTitleAndDescription(
  facts: ProductFacts,
  includePriceSuggestion: boolean = true
): Promise<ListingContent> {
  // TODO: Replace with chrome.ai.writer() call
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      const title = `${facts.brand || ""} ${facts.category}`.trim();
      const description = `Excellent ${facts.condition.toLowerCase()} condition ${facts.category.toLowerCase()}. ${facts.uniqueFeatures.join(
        ", "
      )}. Perfect for anyone looking for quality items.`;

      resolve({
        title: title || "Product Listing",
        description,
        keywords: facts.keywords,
        suggestedPrice: includePriceSuggestion
          ? facts.estimatedPrice
          : undefined,
      });
    }, 800);
  });
}

/**
 * Generate tone variants of the listing content
 * Uses: chrome.ai.rewriter() with tone/style parameters
 *
 * TO REPLACE: Replace with:
 *   const variants = await Promise.all(
 *     ['friendly', 'premium', 'bargain'].map(tone =>
 *       chrome.ai.rewriter({
 *         model: 'chrome.ai/gemini-nano',
 *         text: originalText,
 *         style: tone,
 *         rewriteType: 'tone'
 *       })
 *     )
 *   );
 */
export async function generateVariants(
  originalContent: ListingContent
): Promise<ToneVariant[]> {
  // TODO: Replace with chrome.ai.rewriter() calls
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      const variants: ToneVariant[] = [
        {
          tone: "friendly",
          title: originalContent.title,
          description: `Hey there! 😊 I'm selling this awesome item - ${originalContent.description} Great deal, message me if interested!`,
        },
        {
          tone: "premium",
          title: originalContent.title,
          description: `Premium ${originalContent.description} Exquisite quality and exceptional value. For the discerning buyer.`,
        },
        {
          tone: "bargain",
          title: originalContent.title,
          description: `HUGE DEAL! ${originalContent.description} Amazing price - can't beat this! Selling fast, get it while you can!`,
        },
      ];
      resolve(variants);
    }, 1000);
  });
}

/**
 * Proofread and correct grammar/spelling
 * Uses: chrome.ai.proofreader()
 *
 * TO REPLACE: Replace with:
 *   const result = await chrome.ai.proofreader({
 *     model: 'chrome.ai/gemini-nano',
 *     text: textToProofread,
 *     language: 'en-US'
 *   });
 */
export async function proofreadText(text: string): Promise<string> {
  // TODO: Replace with chrome.ai.proofreader() call
  // Mock implementation - returns text as-is for now
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simple mock: capitalize first letter
      resolve(text.charAt(0).toUpperCase() + text.slice(1));
    }, 500);
  });
}

/**
 * Translate text to target language
 * Uses: chrome.ai.translator()
 *
 * TO REPLACE: Replace with:
 *   const result = await chrome.ai.translator({
 *     model: 'chrome.ai/gemini-nano',
 *     text: textToTranslate,
 *     sourceLanguage: 'en',
 *     targetLanguage: targetLang
 * null });
 */
export async function translateText(
  text: string,
  targetLanguage: "en" | "ur" | "es" | "fr"
): Promise<string> {
  // TODO: Replace with chrome.ai.translator() call
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      if (targetLanguage === "ur") {
        resolve(`[Urdu Translation] ${text}`);
      } else if (targetLanguage === "en") {
        resolve(text);
      } else {
        resolve(`[${targetLanguage.toUpperCase()}] ${text}`);
      }
    }, 600);
  });
}

/**
 * Summarize voice note and generate video script
 * Uses: chrome.ai.summarizer() and chrome.ai.writer()
 *
 * TO REPLACE: Replace with:
 *   1. Summarize: chrome.ai.summarizer({ model: 'chrome.ai/gemini-nano', text: transcript })
 *   2. Generate script: chrome.ai.writer({ model: 'chrome.ai/gemini-nano', prompt: scriptPrompt })
 */
export async function summarizeVoiceNote(
  voiceData: VoiceData,
  productFacts: ProductFacts
): Promise<{ summary: string; videoScript: VideoScript }> {
  // TODO: Replace with chrome.ai.summarizer() and chrome.ai.writer() calls
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      const transcript = voiceData.transcript || "Product in good condition";
      resolve({
        summary: `Voice note summary: ${transcript}`,
        videoScript: {
          script: `Welcome! Today I'm showing you this ${productFacts.category}. ${transcript}. Check it out!`,
          duration: 20,
          keyPoints: ["Condition", "Features", "Price"],
        },
      });
    }, 1000);
  });
}

/**
 * Check if Chrome Built-in AI APIs are available
 * This helps determine if we should use real APIs or fallback to mocks
 */
export function isChromeBuiltInAiAvailable(): boolean {
  // TODO: Replace with actual check
  // return typeof chrome !== 'undefined' && chrome.ai !== undefined;
  return false; // For now, always use mocks
}
