/**
 * Prompt Template Builders
 *
 * These functions generate the exact prompt strings sent to Chrome Built-in AI APIs.
 * These prompts are designed to work with the Prompt API, Writer API, and Rewriter API.
 */

import { ProductFacts } from "../lib/chromeBuiltInAi";

/**
 * Prompt for extracting product facts from images
 * Used with: chrome.ai.prompt() - multimodal analysis
 */
export function buildFactsExtractionPrompt(): string {
  return `You are analyzing product images for a marketplace listing.

Extract the following information:
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
}

/**
 * Prompt for analyzing voice notes
 * Used with: chrome.ai.prompt() - audio transcription + analysis
 */
export function buildVoiceAnalysisPrompt(): string {
  return `You are analyzing a voice note about a product listing.

Extract:
1. Any additional product details mentioned
2. Seller's description of condition
3. Reason for selling
4. Price mentioned (if any)
5. Any special notes or selling points

Return as structured text that can be merged with image analysis results.
Focus on actionable information that enhances the listing.`;
}

/**
 * Prompt for generating SEO-friendly title and description
 * Used with: chrome.ai.writer()
 */
export function buildTitleDescriptionPrompt(facts: ProductFacts): string {
  return `Generate a professional marketplace listing for this product:

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
   - Include brand if available
   - Include key feature or condition
   - Use power words: "Premium", "Excellent", "Rare", etc.

2. A detailed description with:
   - Hook (first line that grabs attention)
   - Key details (2-3 sentences about features and condition)
   - Call to action (friendly closing)

3. A list of 5-7 SEO keywords for search optimization

Format as JSON:
{
  "title": "string",
  "description": "string",
  "keywords": ["kw1", "kw2", ...],
  "suggestedPrice": number or null
}`;
}

/**
 * Prompt for generating tone variants
 * Used with: chrome.ai.rewriter()
 */
export function buildToneVariantPrompt(
  originalText: string,
  tone: "friendly" | "premium" | "bargain"
): string {
  const toneInstructions = {
    friendly: `Rewrite in a friendly, casual tone. Use emojis sparingly (1-2 max). 
    Make it conversational and approachable. Include phrases like "Message me!" or "Feel free to ask!".`,
    premium: `Rewrite in a premium, sophisticated tone. Use formal language.
    Emphasize quality, exclusivity, and value. No emojis. Professional and elegant.`,
    bargain: `Rewrite in an urgent, bargain-focused tone. Use excitement and urgency.
    Include phrases like "Great deal!", "Can't beat this!", "Selling fast!". Use 1-2 emojis for emphasis.`,
  };

  return `Rewrite this marketplace listing text in a ${tone} tone:

ORIGINAL TEXT:
${originalText}

INSTRUCTIONS:
${toneInstructions[tone]}

Maintain the same key information (title, description details) but adjust tone, style, and energy.
Return JSON:
{
  "title": "rewritten title",
  "description": "rewritten description"
}`;
}

/**
 * Prompt for video script generation
 * Used with: chrome.ai.writer()
 */
export function buildVideoScriptPrompt(
  facts: ProductFacts,
  voiceSummary: string
): string {
  return `Create a short video script (15-30 seconds) for a marketplace listing video:

Product: ${facts.category}
${facts.brand ? `Brand: ${facts.brand}` : ""}
Condition: ${facts.condition}
Key Features: ${facts.uniqueFeatures.join(", ")}
Voice Note Summary: ${voiceSummary}

Create:
1. A natural, conversational script that:
   - Introduces the product
   - Highlights 2-3 key features
   - Mentions condition
   - Includes a call to action ("Check it out!" or "Message me!")

2. Ensure it's 15-30 seconds when spoken at normal pace

3. List 3-4 key visual points to show in the video

Return JSON:
{
  "script": "full script text",
  "duration": estimated_seconds,
  "keyPoints": ["point1", "point2", ...]
}`;
}

/**
 * Prompt for thumbnail caption
 * Used with: chrome.ai.writer()
 */
export function buildThumbnailCaptionPrompt(
  facts: ProductFacts,
  title: string
): string {
  return `Create a short, punchy caption for a marketplace listing thumbnail image.

Product Title: ${title}
Category: ${facts.category}
Condition: ${facts.condition}
${facts.estimatedPrice ? `Price: $${facts.estimatedPrice}` : ""}

Requirements:
- 5-8 words max
- Eye-catching and clear
- Include condition or key feature
- No emojis needed (will be overlaid on image)

Return just the caption text, nothing else.`;
}

/**
 * Simple price suggestion heuristic (local, no AI needed)
 * Can be enhanced with optional cloud-based price comparison (opt-in)
 */
export function suggestPrice(facts: ProductFacts): number | null {
  if (facts.estimatedPrice) {
    return facts.estimatedPrice;
  }

  // Simple heuristic based on condition
  // In production, this could call an opt-in price comparison API
  const basePrices: Record<string, number> = {
    Electronics: 100,
    Clothing: 25,
    Furniture: 200,
    Books: 10,
    Sports: 50,
    Tools: 75,
    Toys: 20,
  };

  const base = basePrices[facts.category] || 50;
  const conditionMultiplier: Record<string, number> = {
    New: 1.0,
    "Like New": 0.85,
    Good: 0.65,
    Fair: 0.45,
    Poor: 0.25,
  };

  const multiplier = conditionMultiplier[facts.condition] || 0.5;
  return Math.round(base * multiplier);
}
