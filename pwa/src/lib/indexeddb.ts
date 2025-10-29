/**
 * IndexedDB Storage Layer
 *
 * Stores listings, images, and voice notes locally.
 * Uses the idb library for type-safe IndexedDB operations.
 */

import { openDB, DBSchema, IDBPDatabase } from "idb";
import { ImageData, VoiceData, ListingContent } from "./chromeBuiltInAi";

// Re-export types for convenience
export type { ImageData, VoiceData, ListingContent };

export interface StoredListing {
  id: string;
  createdAt: number;
  updatedAt: number;
  images: ImageData[];
  voiceNote?: VoiceData;
  content: ListingContent;
  facts?: any;
  variants?: any[];
  videoScript?: any;
}

interface MarketMateDB extends DBSchema {
  listings: {
    key: string;
    value: StoredListing;
    indexes: { "by-date": number };
  };
}

let dbPromise: Promise<IDBPDatabase<MarketMateDB>> | null = null;

/**
 * Initialize and return the database connection
 */
async function getDB(): Promise<IDBPDatabase<MarketMateDB>> {
  if (!dbPromise) {
    dbPromise = openDB<MarketMateDB>("marketmate-db", 1, {
      upgrade(db) {
        const store = db.createObjectStore("listings", {
          keyPath: "id",
        });
        store.createIndex("by-date", "createdAt");
      },
    });
  }
  return dbPromise;
}

/**
 * Save a listing to IndexedDB
 */
export async function saveListing(listing: StoredListing): Promise<void> {
  const db = await getDB();
  listing.updatedAt = Date.now();
  await db.put("listings", listing);
}

/**
 * Get a listing by ID
 */
export async function getListing(
  id: string
): Promise<StoredListing | undefined> {
  const db = await getDB();
  return db.get("listings", id);
}

/**
 * Get all listings, sorted by date (newest first)
 */
export async function getAllListings(): Promise<StoredListing[]> {
  const db = await getDB();
  const index = db.transaction("listings", "readonly").store.index("by-date");
  const all = await index.getAll();
  return all.reverse(); // Newest first
}

/**
 * Delete a listing by ID
 */
export async function deleteListing(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("listings", id);
}

/**
 * Clear all listings (useful for testing or privacy)
 */
export async function clearAllListings(): Promise<void> {
  const db = await getDB();
  await db.clear("listings");
}

/**
 * Convert File to ImageData
 */
export async function fileToImageData(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        resolve({
          data: result,
          mimeType: file.type,
        });
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Convert Blob to VoiceData
 */
export async function blobToVoiceData(
  blob: Blob,
  transcript?: string
): Promise<VoiceData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        resolve({
          data: result,
          mimeType: blob.type,
          transcript,
        });
      } else {
        reject(new Error("Failed to read audio blob"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Generate a unique ID for listings
 */
export function generateListingId(): string {
  return `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
