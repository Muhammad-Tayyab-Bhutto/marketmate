import {
  buildFactsExtractionPrompt,
  buildTitleDescriptionPrompt,
  buildToneVariantPrompt,
  suggestPrice,
} from "../pwa/src/utils/promptBuilders";
import { ProductFacts } from "../pwa/src/lib/chromeBuiltInAi";

describe("promptBuilders", () => {
  describe("buildFactsExtractionPrompt", () => {
    it("should generate a prompt for facts extraction", () => {
      const prompt = buildFactsExtractionPrompt();
      expect(prompt).toContain("analyzing product images");
      expect(prompt).toContain("Category");
      expect(prompt).toContain("Brand");
      expect(prompt).toContain("Condition");
      expect(prompt).toContain("JSON");
    });
  });

  describe("buildTitleDescriptionPrompt", () => {
    it("should generate a prompt with product facts", () => {
      const facts: ProductFacts = {
        category: "Electronics",
        brand: "Samsung",
        color: "Black",
        condition: "Good",
        uniqueFeatures: ["Portable", "Bluetooth"],
        keywords: ["electronics", "audio"],
        estimatedPrice: 50,
      };

      const prompt = buildTitleDescriptionPrompt(facts);
      expect(prompt).toContain("Electronics");
      expect(prompt).toContain("Samsung");
      expect(prompt).toContain("Good");
      expect(prompt).toContain("SEO-friendly");
    });
  });

  describe("buildToneVariantPrompt", () => {
    it("should generate tone-specific prompts", () => {
      const originalText = "Test listing";

      const friendly = buildToneVariantPrompt(originalText, "friendly");
      expect(friendly).toContain("friendly");
      expect(friendly).toContain("conversational");

      const premium = buildToneVariantPrompt(originalText, "premium");
      expect(premium).toContain("premium");
      expect(premium).toContain("sophisticated");

      const bargain = buildToneVariantPrompt(originalText, "bargain");
      expect(bargain).toContain("bargain");
      expect(bargain).toContain("urgent");
    });
  });

  describe("suggestPrice", () => {
    it("should use estimated price if available", () => {
      const facts: ProductFacts = {
        category: "Electronics",
        condition: "Good",
        uniqueFeatures: [],
        keywords: [],
        estimatedPrice: 100,
      };

      expect(suggestPrice(facts)).toBe(100);
    });

    it("should calculate price based on category and condition", () => {
      const facts: ProductFacts = {
        category: "Electronics",
        condition: "Good",
        uniqueFeatures: [],
        keywords: [],
      };

      const price = suggestPrice(facts);
      expect(price).toBeGreaterThan(0);
      expect(price).toBeLessThan(200);
    });

    it("should apply condition multipliers correctly", () => {
      const baseFacts: ProductFacts = {
        category: "Electronics",
        condition: "New",
        uniqueFeatures: [],
        keywords: [],
      };

      const newPrice = suggestPrice(baseFacts);

      baseFacts.condition = "Poor";
      const poorPrice = suggestPrice(baseFacts);

      expect(newPrice).toBeGreaterThan(poorPrice);
    });
  });
});
