import {
  generateFactsFromImageAndVoice,
  generateTitleAndDescription,
  generateVariants,
  proofreadText,
  translateText,
  isChromeBuiltInAiAvailable,
} from "../pwa/src/lib/chromeBuiltInAi";
import {
  ImageData,
  VoiceData,
  ProductFacts,
} from "../pwa/src/lib/chromeBuiltInAi";

describe("chromeBuiltInAi", () => {
  describe("generateFactsFromImageAndVoice", () => {
    it("should generate product facts from images", async () => {
      const images: ImageData[] = [
        { data: "data:image/png;base64,test", mimeType: "image/png" },
      ];

      const facts = await generateFactsFromImageAndVoice(images);
      expect(facts).toHaveProperty("category");
      expect(facts).toHaveProperty("condition");
      expect(facts).toHaveProperty("uniqueFeatures");
      expect(facts).toHaveProperty("keywords");
    });

    it("should handle voice notes", async () => {
      const images: ImageData[] = [
        { data: "data:image/png;base64,test", mimeType: "image/png" },
      ];
      const voice: VoiceData = {
        data: "data:audio/webm;base64,test",
        mimeType: "audio/webm",
        transcript: "Test voice note",
      };

      const facts = await generateFactsFromImageAndVoice(images, voice);
      expect(facts.notes).toContain("voice");
    });
  });

  describe("generateTitleAndDescription", () => {
    it("should generate listing content", async () => {
      const facts: ProductFacts = {
        category: "Electronics",
        condition: "Good",
        uniqueFeatures: ["Feature 1"],
        keywords: ["keyword1"],
      };

      const content = await generateTitleAndDescription(facts);
      expect(content).toHaveProperty("title");
      expect(content).toHaveProperty("description");
      expect(content).toHaveProperty("keywords");
    });
  });

  describe("generateVariants", () => {
    it("should generate tone variants", async () => {
      const content = {
        title: "Test Product",
        description: "Test description",
        keywords: ["test"],
      };

      const variants = await generateVariants(content);
      expect(variants).toHaveLength(3);
      expect(variants[0].tone).toBe("friendly");
      expect(variants[1].tone).toBe("premium");
      expect(variants[2].tone).toBe("bargain");
    });
  });

  describe("proofreadText", () => {
    it("should return processed text", async () => {
      const result = await proofreadText("test text");
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("translateText", () => {
    it("should translate to different languages", async () => {
      const result = await translateText("Hello", "ur");
      expect(typeof result).toBe("string");
    });
  });

  describe("isChromeBuiltInAiAvailable", () => {
    it("should return boolean", () => {
      const result = isChromeBuiltInAiAvailable();
      expect(typeof result).toBe("boolean");
    });
  });
});
