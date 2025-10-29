import {
  saveListing,
  getListing,
  getAllListings,
  deleteListing,
  clearAllListings,
  generateListingId,
  fileToImageData,
  blobToVoiceData,
} from "../pwa/src/lib/indexeddb";
import { StoredListing, ImageData, VoiceData } from "../pwa/src/lib/indexeddb";

describe("indexeddb", () => {
  beforeEach(async () => {
    await clearAllListings();
  });

  describe("generateListingId", () => {
    it("should generate unique IDs", () => {
      const id1 = generateListingId();
      const id2 = generateListingId();
      expect(id1).not.toBe(id2);
      expect(id1).toContain("listing_");
    });
  });

  describe("saveListing and getListing", () => {
    it("should save and retrieve a listing", async () => {
      const listing: StoredListing = {
        id: generateListingId(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        images: [],
        content: {
          title: "Test",
          description: "Test description",
          keywords: ["test"],
        },
      };

      await saveListing(listing);
      const retrieved = await getListing(listing.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(listing.id);
      expect(retrieved?.content.title).toBe("Test");
    });
  });

  describe("getAllListings", () => {
    it("should return all listings", async () => {
      const listing1: StoredListing = {
        id: generateListingId(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        images: [],
        content: {
          title: "Test 1",
          description: "Desc 1",
          keywords: [],
        },
      };

      const listing2: StoredListing = {
        id: generateListingId(),
        createdAt: Date.now() + 1000,
        updatedAt: Date.now() + 1000,
        images: [],
        content: {
          title: "Test 2",
          description: "Desc 2",
          keywords: [],
        },
      };

      await saveListing(listing1);
      await saveListing(listing2);

      const all = await getAllListings();
      expect(all.length).toBeGreaterThanOrEqual(2);
      // Should be sorted newest first
      expect(all[0].createdAt).toBeGreaterThanOrEqual(all[1]?.createdAt || 0);
    });
  });

  describe("deleteListing", () => {
    it("should delete a listing", async () => {
      const listing: StoredListing = {
        id: generateListingId(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        images: [],
        content: {
          title: "Test",
          description: "Test",
          keywords: [],
        },
      };

      await saveListing(listing);
      await deleteListing(listing.id);
      const retrieved = await getListing(listing.id);

      expect(retrieved).toBeUndefined();
    });
  });
});
