// Jest setup file

// Mock IndexedDB for tests
const FDBFactory = require("fake-indexeddb/lib/FDBFactory");
const IDBKeyRange = require("fake-indexeddb/lib/FDBKeyRange");

// Set up fake IndexedDB before importing idb
(global as any).indexedDB = new FDBFactory();
(global as any).IDBKeyRange = IDBKeyRange;
