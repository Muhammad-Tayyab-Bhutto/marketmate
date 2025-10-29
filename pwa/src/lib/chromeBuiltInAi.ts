/**
 * Chrome Built-in AI API Implementation
 *
 * This module implements Chrome's Built-in AI APIs with real API calls.
 * Falls back to mock implementations if APIs are not available.
 *
 * API Usage:
 * - chrome.ai.prompt() - Multimodal prompt API for image + text analysis
 * - chrome.ai.writer() - Content generation API
 * - chrome.ai.rewriter() - Content rewriting with tone/style variants
 * - chrome.ai.proofreader() - Grammar and spelling correction
 * - chrome.ai.summarizer() - Text summarization
 * - chrome.ai.translator() - Translation API
 *
 * All functions work offline when using chrome.ai/gemini-nano model.
 * Functions automatically fall back to mock implementations if APIs are unavailable.
 *
 * Configuration is loaded from environment variables via api.config.ts
 */

import {
  chromeAiConfig,
  translatorConfig,
  featureFlags,
} from "../config/api.config";

// TypeScript declarations for Chrome Built-in AI APIs
declare global {
  interface Window {
    chrome?: {
      ai?: {
        prompt: (options: {
          model: string;
          messages: Array<{
            role: string;
            content: any[];
          }>;
        }) => Promise<{
          messages: Array<{ content?: Array<{ text?: string }> }>;
        }>;
        writer: (options: {
          model: string;
          prompt: string;
          format?: string;
          schema?: any;
        }) => Promise<string | any>;
        rewriter: (options: {
          model: string;
          text: string;
          style: string;
          rewriteType: string;
        }) => Promise<string | { text: string }>;
        proofreader: (options: {
          model: string;
          text: string;
          language: string;
        }) => Promise<string | { text: string }>;
        summarizer: (options: {
          model: string;
          text: string;
        }) => Promise<string | { text: string }>;
        translator: (options: {
          model: string;
          text: string;
          sourceLanguage: string;
          targetLanguage: string;
        }) => Promise<string | { text: string }>;
      };
    };
  }
}

// Chrome extension context (for Chrome extensions)
declare const chrome: typeof window.chrome;

// Web Translator API types (from MDN: https://developer.mozilla.org/en-US/docs/Web/API/Translator_and_Language_Detector_APIs)
interface Translator {
  translate(
    text: string,
    options?: {
      sourceLanguage?: string;
      targetLanguage: string;
    }
  ): Promise<string>;
  destroy(): void;
  getSupportedLanguages(): Promise<string[]>;
}

interface LanguageDetector {
  detect(text: string): Promise<string>;
  destroy(): void;
}

declare global {
  var Translator:
    | {
        create(options?: { signal?: AbortSignal }): Promise<Translator>;
        isSupported(): boolean;
      }
    | undefined;

  var LanguageDetector:
    | {
        create(options?: { signal?: AbortSignal }): Promise<LanguageDetector>;
        isSupported(): boolean;
      }
    | undefined;
}

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
 */
export async function generateFactsFromImageAndVoice(
  images: ImageData[],
  voiceData?: VoiceData
): Promise<ProductFacts> {
  const promptText = `Analyze these product images and extract:
1. Category (e.g., Electronics, Clothing, Furniture, Books)
2. Brand (if visible/identifiable)
3. Color(s)
4. Condition (New, Like New, Good, Fair, Poor)
5. Unique features (list 3-5 key selling points)
6. Keywords (3-7 relevant search terms)
7. Estimated market price (in USD, if reasonable to estimate)

Return structured JSON with this exact format:
{
  "category": "string",
  "brand": "string or null",
  "color": "string or null",
  "condition": "New|Like New|Good|Fair|Poor",
  "uniqueFeatures": ["feature1", "feature2", ...],
  "keywords": ["keyword1", "keyword2", ...],
  "estimatedPrice": number or null,
  "notes": "string"
}

Be specific and accurate. Focus on visible details.`;

  if (isChromeBuiltInAiAvailable()) {
    try {
      const chromeAi = (typeof chrome !== "undefined" ? chrome : window.chrome)
        ?.ai;
      if (!chromeAi) throw new Error("Chrome AI not available");

      const content: any[] = [
        { type: "text", text: promptText },
        ...images.map((img) => ({
          type: "image",
          image: img.data.replace(/^data:image\/[^;]+;base64,/, ""),
        })),
      ];

      if (voiceData?.transcript) {
        content.push({
          type: "text",
          text: `Voice note: ${voiceData.transcript}`,
        });
      }

      const result = await chromeAi.prompt({
        model: chromeAiConfig.model,
        messages: [
          {
            role: "user",
            content: content,
          },
        ],
      });

      // Parse the JSON response
      const responseText = result.messages[0]?.content?.[0]?.text || "{}";
      const parsed = JSON.parse(responseText);

      return {
        category: parsed.category || "Unknown",
        brand: parsed.brand || undefined,
        color: parsed.color || undefined,
        condition: parsed.condition || "Good",
        uniqueFeatures: parsed.uniqueFeatures || [],
        keywords: parsed.keywords || [],
        estimatedPrice: parsed.estimatedPrice || undefined,
        notes: parsed.notes || voiceData?.transcript || "",
      };
    } catch (error) {
      console.error("Error calling chrome.ai.prompt:", error);
      // Fall through to mock implementation
    }
  }

  // Fallback mock implementation
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
 */
export async function generateTitleAndDescription(
  facts: ProductFacts,
  includePriceSuggestion: boolean = true
): Promise<ListingContent> {
  const promptText = `Generate a professional marketplace listing for this product:

Category: ${facts.category}
${facts.brand ? `Brand: ${facts.brand}` : ""}
${facts.color ? `Color: ${facts.color}` : ""}
Condition: ${facts.condition}
Features: ${facts.uniqueFeatures.join(", ")}
Keywords: ${facts.keywords.join(", ")}
${facts.estimatedPrice ? `Suggested Price: $${facts.estimatedPrice}` : ""}
${facts.notes ? `Additional Notes: ${facts.notes}` : ""}

Create:
1. A compelling, SEO-friendly title (50-60 characters max)
2. A detailed description with hook, key details, and call to action
3. A list of 5-7 SEO keywords

Format as JSON:
{
  "title": "string",
  "description": "string",
  "keywords": ["kw1", "kw2", ...],
  "suggestedPrice": number or null
}`;

  if (isChromeBuiltInAiAvailable()) {
    try {
      const chromeAi = (typeof chrome !== "undefined" ? chrome : window.chrome)
        ?.ai;
      if (!chromeAi) throw new Error("Chrome AI not available");

      const result = await chromeAi.writer({
        model: chromeAiConfig.model,
        prompt: promptText,
        format: "structured",
        schema: {
          title: "string",
          description: "string",
          keywords: "array",
          suggestedPrice: "number",
        },
      });

      const parsed = typeof result === "string" ? JSON.parse(result) : result;

      return {
        title:
          parsed.title ||
          `${facts.brand || ""} ${facts.category}`.trim() ||
          "Product Listing",
        description:
          parsed.description ||
          `Excellent ${facts.condition.toLowerCase()} condition ${facts.category.toLowerCase()}.`,
        keywords: parsed.keywords || facts.keywords,
        suggestedPrice: includePriceSuggestion
          ? parsed.suggestedPrice || facts.estimatedPrice
          : undefined,
      };
    } catch (error) {
      console.error("Error calling chrome.ai.writer:", error);
      // Fall through to mock implementation
    }
  }

  // Fallback mock implementation
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
 */
export async function generateVariants(
  originalContent: ListingContent
): Promise<ToneVariant[]> {
  const originalText = `${originalContent.title}\n\n${originalContent.description}`;
  const tones: ("friendly" | "premium" | "bargain")[] = [
    "friendly",
    "premium",
    "bargain",
  ];

  if (isChromeBuiltInAiAvailable()) {
    try {
      const chromeAi = (typeof chrome !== "undefined" ? chrome : window.chrome)
        ?.ai;
      if (!chromeAi) throw new Error("Chrome AI not available");

      const variantPromises = tones.map(async (tone) => {
        try {
          const result = await chromeAi.rewriter({
            model: chromeAiConfig.model,
            text: originalText,
            style: tone,
            rewriteType: "tone",
          });

          const rewrittenText =
            typeof result === "string" ? result : result.text || originalText;
          const lines = rewrittenText.split("\n\n");

          return {
            tone,
            title: lines[0] || originalContent.title,
            description: lines.slice(1).join("\n\n") || rewrittenText,
          };
        } catch (error) {
          console.error(`Error calling chrome.ai.rewriter for ${tone}:`, error);
          // Return mock variant if API call fails
          return getMockVariant(tone, originalContent);
        }
      });

      return await Promise.all(variantPromises);
    } catch (error) {
      console.error("Error generating variants:", error);
      // Fall through to mock implementation
    }
  }

  // Fallback mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(tones.map((tone) => getMockVariant(tone, originalContent)));
    }, 1000);
  });
}

function getMockVariant(
  tone: "friendly" | "premium" | "bargain",
  originalContent: ListingContent
): ToneVariant {
  switch (tone) {
    case "friendly":
      return {
        tone: "friendly",
        title: originalContent.title,
        description: `Hey there! 😊 I'm selling this awesome item - ${originalContent.description} Great deal, message me if interested!`,
      };
    case "premium":
      return {
        tone: "premium",
        title: originalContent.title,
        description: `Premium ${originalContent.description} Exquisite quality and exceptional value. For the discerning buyer.`,
      };
    case "bargain":
      return {
        tone: "bargain",
        title: originalContent.title,
        description: `HUGE DEAL! ${originalContent.description} Amazing price - can't beat this! Selling fast, get it while you can!`,
      };
  }
}

/**
 * Proofread and correct grammar/spelling
 * Uses: chrome.ai.proofreader()
 */
export async function proofreadText(text: string): Promise<string> {
  if (isChromeBuiltInAiAvailable()) {
    try {
      const chromeAi = (typeof chrome !== "undefined" ? chrome : window.chrome)
        ?.ai;
      if (!chromeAi) throw new Error("Chrome AI not available");

      const result = await chromeAi.proofreader({
        model: chromeAiConfig.model,
        text: text,
        language: "en-US",
      });

      return typeof result === "string" ? result : result.text || text;
    } catch (error) {
      console.error("Error calling chrome.ai.proofreader:", error);
      // Fall through to mock implementation
    }
  }

  // Fallback mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simple mock: capitalize first letter
      resolve(text.charAt(0).toUpperCase() + text.slice(1));
    }, 500);
  });
}

/**
 * Translate text to target language
 * Uses: Web Translator API (MDN) or chrome.ai.translator()
 * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Translator_and_Language_Detector_APIs
 */
export async function translateText(
  text: string,
  targetLanguage: "en" | "ur" | "es" | "fr"
): Promise<string> {
  // Try Web Translator API first (available in Chrome now)
  if (
    translatorConfig.enabled &&
    typeof Translator !== "undefined" &&
    Translator?.isSupported?.()
  ) {
    try {
      const translator = await Translator.create();
      const translated = await translator.translate(text, {
        sourceLanguage: translatorConfig.defaultSourceLanguage,
        targetLanguage: targetLanguage,
      });
      translator.destroy(); // Clean up resources
      return translated;
    } catch (error) {
      console.error("Error using Web Translator API:", error);
      // Fall through to next method
    }
  }

  // Try Chrome Built-in AI API (if available)
  if (isChromeBuiltInAiAvailable()) {
    try {
      const chromeAi = (typeof chrome !== "undefined" ? chrome : window.chrome)
        ?.ai;
      if (!chromeAi) throw new Error("Chrome AI not available");

      const result = await chromeAi.translator({
        model: chromeAiConfig.model,
        text: text,
        sourceLanguage: translatorConfig.defaultSourceLanguage,
        targetLanguage: targetLanguage,
      });

      return typeof result === "string" ? result : result.text || text;
    } catch (error) {
      console.error("Error calling chrome.ai.translator:", error);
      // Fall through to mock implementation
    }
  }

  // Fallback mock implementation
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
 */
export async function summarizeVoiceNote(
  voiceData: VoiceData,
  productFacts: ProductFacts
): Promise<{ summary: string; videoScript: VideoScript }> {
  const transcript = voiceData.transcript || "Product in good condition";

  if (isChromeBuiltInAiAvailable()) {
    try {
      const chromeAi = (typeof chrome !== "undefined" ? chrome : window.chrome)
        ?.ai;
      if (!chromeAi) throw new Error("Chrome AI not available");

      // Step 1: Summarize the voice note
      const summaryResult = await chromeAi.summarizer({
        model: chromeAiConfig.model,
        text: transcript,
      });

      const summary =
        typeof summaryResult === "string"
          ? summaryResult
          : summaryResult.text || transcript;

      // Step 2: Generate video script
      const scriptPrompt = `Create a short video script (15-30 seconds) for a marketplace listing video:

Product: ${productFacts.category}
${productFacts.brand ? `Brand: ${productFacts.brand}` : ""}
Condition: ${productFacts.condition}
Key Features: ${productFacts.uniqueFeatures.join(", ")}
Voice Note Summary: ${summary}

Create:
1. A natural, conversational script that introduces the product, highlights 2-3 key features, mentions condition, and includes a call to action
2. Ensure it's 15-30 seconds when spoken at normal pace
3. List 3-4 key visual points to show in the video

Format as JSON:
{
  "script": "full script text",
  "duration": estimated_seconds,
  "keyPoints": ["point1", "point2", ...]
}`;

      const scriptResult = await chromeAi.writer({
        model: chromeAiConfig.model,
        prompt: scriptPrompt,
        format: "structured",
        schema: {
          script: "string",
          duration: "number",
          keyPoints: "array",
        },
      });

      const scriptParsed =
        typeof scriptResult === "string"
          ? JSON.parse(scriptResult)
          : scriptResult;

      return {
        summary: summary,
        videoScript: {
          script:
            scriptParsed.script ||
            `Welcome! Today I'm showing you this ${productFacts.category}. ${summary}. Check it out!`,
          duration: scriptParsed.duration || 20,
          keyPoints: scriptParsed.keyPoints || [
            "Condition",
            "Features",
            "Price",
          ],
        },
      };
    } catch (error) {
      console.error("Error calling chrome.ai.summarizer/writer:", error);
      // Fall through to mock implementation
    }
  }

  // Fallback mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
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
  // Check feature flags first
  if (!chromeAiConfig.enabled) return false;
  if (featureFlags.useMockApis) return false;

  // Check if Chrome AI is actually available
  const chromeObj = typeof chrome !== "undefined" ? chrome : window.chrome;
  return chromeObj?.ai !== undefined;
}
