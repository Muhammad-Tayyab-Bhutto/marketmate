// Jest setup file

// Polyfill for structuredClone (Node.js < 17)
if (typeof structuredClone === "undefined") {
  (global as any).structuredClone = (obj: any) =>
    JSON.parse(JSON.stringify(obj));
}

// Mock IndexedDB for tests - must be set up before any imports
import "fake-indexeddb/auto";

// Initialize fake IndexedDB
const FDBFactory = require("fake-indexeddb/lib/FDBFactory");
const IDBKeyRange = require("fake-indexeddb/lib/FDBKeyRange");

if (!(global as any).indexedDB) {
  (global as any).indexedDB = new FDBFactory();
}
if (!(global as any).IDBKeyRange) {
  (global as any).IDBKeyRange = IDBKeyRange;
}
if (!(global as any).IDBRequest) {
  (global as any).IDBRequest = require("fake-indexeddb/lib/FDBRequest");
}
if (!(global as any).IDBOpenDBRequest) {
  (
    global as any
  ).IDBOpenDBRequest = require("fake-indexeddb/lib/FDBOpenDBRequest");
}
if (!(global as any).IDBDatabase) {
  (global as any).IDBDatabase = require("fake-indexeddb/lib/FDBDatabase");
}
